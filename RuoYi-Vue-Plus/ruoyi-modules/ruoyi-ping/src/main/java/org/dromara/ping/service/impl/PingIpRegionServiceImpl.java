package org.dromara.ping.service.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.core.utils.ip.RegionUtils;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.PingIpFeedback;
import org.dromara.ping.domain.vo.PingIpDatabaseStatusVo;
import org.dromara.ping.mapper.PingIpFeedbackMapper;
import org.dromara.ping.service.IPingIpRegionService;
import org.lionsoul.ip2region.service.Config;
import org.lionsoul.ip2region.service.Ip2Region;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigInteger;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Comparator;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Slf4j
@Service
@RequiredArgsConstructor
public class PingIpRegionServiceImpl implements IPingIpRegionService {

    private static final String IPV4 = "ipv4";
    private static final String IPV6 = "ipv6";

    private final PingProperties properties;
    private final PingIpFeedbackMapper ipFeedbackMapper;
    private final AtomicReference<Ip2Region> ipv4Database = new AtomicReference<>();
    private final AtomicReference<Ip2Region> ipv6Database = new AtomicReference<>();
    private final AtomicReference<List<ApprovedCorrection>> approvedCorrections = new AtomicReference<>(List.of());
    private final ReentrantReadWriteLock databaseLock = new ReentrantReadWriteLock();

    @PostConstruct
    public void initialize() {
        loadExisting(IPV4, ipv4Database);
        loadExisting(IPV6, ipv6Database);
        try {
            refreshApprovedCorrections();
        } catch (RuntimeException e) {
            // The application can start before the one-time feedback table migration is applied.
            log.warn("ping IP纠错规则加载失败，将仅使用地址库", e);
        }
    }

    @Override
    public String lookup(String ip) {
        if (StringUtils.isBlank(ip)) {
            return RegionUtils.UNKNOWN_ADDRESS;
        }
        String correctedLocation = lookupApprovedCorrection(ip);
        if (StringUtils.isNotBlank(correctedLocation)) {
            return correctedLocation;
        }
        AtomicReference<Ip2Region> reference = ip.contains(":") ? ipv6Database : ipv4Database;
        databaseLock.readLock().lock();
        try {
            Ip2Region customDatabase = reference.get();
            String region = customDatabase == null ? RegionUtils.getRegion(ip) : customDatabase.search(ip);
            return normalizeRegion(region);
        } catch (Exception e) {
            log.warn("ping IP归属查询失败 ip={}", ip, e);
            return RegionUtils.UNKNOWN_ADDRESS;
        } finally {
            databaseLock.readLock().unlock();
        }
    }

    @Override
    public void refreshApprovedCorrections() {
        List<ApprovedCorrection> corrections = ipFeedbackMapper.selectList(Wrappers.<PingIpFeedback>lambdaQuery()
                .eq(PingIpFeedback::getStatus, "approved")
                .orderByDesc(PingIpFeedback::getReviewTime)
                .orderByDesc(PingIpFeedback::getId))
            .stream()
            .map(this::toApprovedCorrection)
            .filter(java.util.Objects::nonNull)
            .sorted(Comparator.comparing(ApprovedCorrection::rangeSize).thenComparing(ApprovedCorrection::id, Comparator.reverseOrder()))
            .toList();
        approvedCorrections.set(corrections);
        log.info("已加载okping IP纠错规则 count={}", corrections.size());
    }

    @Override
    public List<PingIpDatabaseStatusVo> status() {
        return List.of(buildStatus(IPV4), buildStatus(IPV6));
    }

    @Override
    public PingIpDatabaseStatusVo upload(String version, MultipartFile file) {
        String normalizedVersion = normalizeVersion(version);
        validateUpload(file);
        Path directory = databaseDirectory();
        Path tempFile = null;
        Ip2Region loadedDatabase = null;
        try {
            Files.createDirectories(directory);
            tempFile = Files.createTempFile(directory, "ip2region-" + normalizedVersion + "-", ".xdb.upload");
            try (var inputStream = file.getInputStream()) {
                Files.copy(inputStream, tempFile, StandardCopyOption.REPLACE_EXISTING);
            }
            loadedDatabase = loadDatabase(tempFile, normalizedVersion);
            Path target = databasePath(normalizedVersion);
            moveReplacing(tempFile, target);
            tempFile = null;
            swapDatabase(normalizedVersion, loadedDatabase);
            loadedDatabase = null;
            log.info("ping {} IP地址库已更新 path={}, size={}", normalizedVersion, target, Files.size(target));
            return buildStatus(normalizedVersion);
        } catch (Exception e) {
            closeDatabase(loadedDatabase);
            throw new ServiceException("IP地址库上传失败：{}", e.getMessage());
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException e) {
                    log.warn("删除IP地址库临时文件失败 path={}", tempFile, e);
                }
            }
        }
    }

    @PreDestroy
    public void close() {
        closeDatabase(ipv4Database.getAndSet(null));
        closeDatabase(ipv6Database.getAndSet(null));
    }

    private void loadExisting(String version, AtomicReference<Ip2Region> reference) {
        Path path = databasePath(version);
        if (!Files.isRegularFile(path)) {
            return;
        }
        try {
            reference.set(loadDatabase(path, version));
            log.info("已加载ping自定义{} IP地址库 path={}", version, path);
        } catch (Exception e) {
            log.error("ping自定义{} IP地址库加载失败，将使用内置地址库 path={}", version, path, e);
        }
    }

    private Ip2Region loadDatabase(Path path, String version) throws Exception {
        if (IPV6.equals(version)) {
            Config config = Config.custom()
                .setCachePolicy(Config.BufferCache)
                .setXdbFile(path.toFile())
                .setCacheSliceBytes(RegionUtils.DEFAULT_CACHE_SLICE_BYTES)
                .asV6();
            return Ip2Region.create(null, config);
        }
        Config config = Config.custom()
            .setCachePolicy(Config.BufferCache)
            .setXdbFile(path.toFile())
            .setCacheSliceBytes(RegionUtils.DEFAULT_CACHE_SLICE_BYTES)
            .asV4();
        return Ip2Region.create(config, null);
    }

    private void swapDatabase(String version, Ip2Region database) {
        AtomicReference<Ip2Region> reference = IPV6.equals(version) ? ipv6Database : ipv4Database;
        databaseLock.writeLock().lock();
        try {
            closeDatabase(reference.getAndSet(database));
        } finally {
            databaseLock.writeLock().unlock();
        }
    }

    private void validateUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ServiceException("请选择XDB地址库文件");
        }
        String filename = file.getOriginalFilename();
        if (StringUtils.isBlank(filename) || !filename.toLowerCase(Locale.ROOT).endsWith(".xdb")) {
            throw new ServiceException("仅支持.xdb格式的IP地址库");
        }
        long maxUploadBytes = properties.getIpDatabase().getMaxUploadBytes();
        if (file.getSize() > maxUploadBytes) {
            throw new ServiceException("IP地址库文件不能超过{}MB", maxUploadBytes / 1024 / 1024);
        }
    }

    private String normalizeVersion(String version) {
        String normalized = StringUtils.isBlank(version) ? "" : version.trim().toLowerCase(Locale.ROOT);
        if (!IPV4.equals(normalized) && !IPV6.equals(normalized)) {
            throw new ServiceException("IP地址库版本仅支持ipv4或ipv6");
        }
        return normalized;
    }

    private String normalizeRegion(String region) {
        if (StringUtils.isBlank(region)) {
            return RegionUtils.UNKNOWN_ADDRESS;
        }
        String[] fields = region.split("\\|", -1);
        for (int i = 0; i < fields.length; i++) {
            if (StringUtils.isBlank(fields[i]) || "0".equals(fields[i])) {
                fields[i] = RegionUtils.UNKNOWN_ADDRESS;
            }
        }
        return String.join("|", fields);
    }

    private String lookupApprovedCorrection(String ip) {
        ParsedIp parsedIp = parseIp(ip);
        if (parsedIp == null) {
            return null;
        }
        for (ApprovedCorrection correction : approvedCorrections.get()) {
            if (correction.version().equals(parsedIp.version())
                && parsedIp.value().compareTo(correction.start()) >= 0
                && parsedIp.value().compareTo(correction.end()) <= 0) {
                return correction.location();
            }
        }
        return null;
    }

    private ApprovedCorrection toApprovedCorrection(PingIpFeedback feedback) {
        ParsedIp start = parseIp(feedback.getStartIp());
        ParsedIp end = parseIp(feedback.getEndIp());
        if (start == null || end == null || !start.version().equals(end.version()) || start.value().compareTo(end.value()) > 0) {
            log.warn("忽略格式错误的ping IP纠错规则 id={}", feedback.getId());
            return null;
        }
        return new ApprovedCorrection(
            feedback.getId(), start.version(), start.value(), end.value(), end.value().subtract(start.value()), normalizeRegion(feedback.getLocation())
        );
    }

    private ParsedIp parseIp(String rawIp) {
        String ip = rawIp == null ? "" : rawIp.trim();
        if (ip.startsWith("[") && ip.endsWith("]")) {
            ip = ip.substring(1, ip.length() - 1);
        }
        try {
            InetAddress address;
            String version;
            if (ip.matches("^(25[0-5]|2[0-4]\\d|[01]?\\d?\\d)(\\.(25[0-5]|2[0-4]\\d|[01]?\\d?\\d)){3}$")) {
                address = InetAddress.getByName(ip);
                version = IPV4;
            } else if (ip.contains(":")) {
                address = InetAddress.getByName(ip);
                if (!(address instanceof Inet6Address)) {
                    return null;
                }
                version = IPV6;
            } else {
                return null;
            }
            return new ParsedIp(version, new BigInteger(1, address.getAddress()));
        } catch (UnknownHostException e) {
            return null;
        }
    }

    private record ParsedIp(String version, BigInteger value) {
    }

    private record ApprovedCorrection(Long id, String version, BigInteger start, BigInteger end, BigInteger rangeSize, String location) {
    }

    private PingIpDatabaseStatusVo buildStatus(String version) {
        Path path = databasePath(version);
        AtomicReference<Ip2Region> reference = IPV6.equals(version) ? ipv6Database : ipv4Database;
        PingIpDatabaseStatusVo status = new PingIpDatabaseStatusVo();
        status.setVersion(version);
        status.setCustom(Files.isRegularFile(path) && reference.get() != null);
        status.setFileName(status.isCustom() ? path.getFileName().toString() : "内置地址库");
        if (status.isCustom()) {
            try {
                status.setFileSize(Files.size(path));
                Instant modifiedAt = Files.getLastModifiedTime(path).toInstant();
                status.setUpdatedAt(modifiedAt.toString());
            } catch (IOException e) {
                log.warn("读取IP地址库状态失败 path={}", path, e);
            }
        }
        return status;
    }

    private Path databaseDirectory() {
        return Path.of(properties.getIpDatabase().getDirectory()).toAbsolutePath().normalize();
    }

    private Path databasePath(String version) {
        return databaseDirectory().resolve("ip2region_" + (IPV6.equals(version) ? "v6" : "v4") + ".xdb");
    }

    private void moveReplacing(Path source, Path target) throws IOException {
        try {
            Files.move(source, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        } catch (AtomicMoveNotSupportedException e) {
            Files.move(source, target, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private void closeDatabase(Ip2Region database) {
        if (database == null) {
            return;
        }
        try {
            database.close(10000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
