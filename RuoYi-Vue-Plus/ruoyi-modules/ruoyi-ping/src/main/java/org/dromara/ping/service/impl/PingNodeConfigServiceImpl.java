package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dromara.common.core.utils.MapstructUtils;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.PingNodeConfig;
import org.dromara.ping.config.PingProperties;
import org.dromara.ping.domain.bo.PingNodeConfigBo;
import org.dromara.ping.domain.dto.NodeListQueryDto;
import org.dromara.ping.domain.vo.PingFirstNodeVo;
import org.dromara.ping.domain.vo.PingNodeConfigVo;
import org.dromara.ping.domain.vo.PingNodeInfoVo;
import org.dromara.ping.domain.vo.PingNodeListedVo;
import org.dromara.ping.mapper.PingNodeConfigMapper;
import org.dromara.ping.service.IPingNodeConfigService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class PingNodeConfigServiceImpl implements IPingNodeConfigService {

    private static final String ENABLED_STATE = "on";
    private static final String DISABLED_STATE = "off";
    private static final String DEFAULT_NODE_EXCHANGE = "ping_node";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final PingNodeConfigMapper baseMapper;
    private final PingProperties pingProperties;

    @Override
    public PingNodeConfigVo queryById(Long id) {
        return baseMapper.selectVoById(id);
    }

    @Override
    public TableDataInfo<PingNodeConfigVo> queryPageList(PingNodeConfigBo bo, PageQuery pageQuery) {
        LambdaQueryWrapper<PingNodeConfig> lqw = buildQueryWrapper(bo);
        Page<PingNodeConfigVo> result = baseMapper.selectVoPage(pageQuery.build(), lqw);
        return TableDataInfo.build(result);
    }

    @Override
    public List<PingNodeConfigVo> queryList(PingNodeConfigBo bo) {
        return baseMapper.selectVoList(buildQueryWrapper(bo));
    }

    @Override
    public Boolean insertByBo(PingNodeConfigBo bo) {
        PingNodeConfig add = MapstructUtils.convert(bo, PingNodeConfig.class);
        validEntityBeforeSave(add, true);
        boolean flag = baseMapper.insert(add) > 0;
        if (flag) {
            bo.setId(add.getId());
        }
        return flag;
    }

    @Override
    public Boolean updateByBo(PingNodeConfigBo bo) {
        PingNodeConfig update = MapstructUtils.convert(bo, PingNodeConfig.class);
        validEntityBeforeSave(update, false);
        return baseMapper.updateById(update) > 0;
    }

    @Override
    public Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid) {
        return baseMapper.deleteByIds(ids) > 0;
    }

    @Override
    public List<PingNodeListedVo> listAvailableNodes() {
        LambdaQueryWrapper<PingNodeConfig> lqw = availableWrapper();
        return baseMapper.selectList(lqw).stream().map(this::toListedVo).toList();
    }

    @Override
    public List<PingFirstNodeVo> firstList() {
        return baseMapper.selectList(availableWrapper()).stream()
            .map(this::toFirstNodeVo)
            .toList();
    }

    @Override
    public List<PingFirstNodeVo> tracerouteFirstList() {
        return baseMapper.selectList(availableWrapper().eq(PingNodeConfig::getTraceroute, true)).stream()
            .map(this::toFirstNodeVo)
            .toList();
    }

    @Override
    public List<PingFirstNodeVo> ipv6FirstList() {
        return baseMapper.selectList(availableWrapper().eq(PingNodeConfig::getIpv6, true)).stream()
            .map(this::toFirstNodeVo)
            .toList();
    }

    @Override
    public List<PingFirstNodeVo> ipv6TracerouteFirstList() {
        return baseMapper.selectList(availableWrapper()
                .eq(PingNodeConfig::getIpv6, true)
                .eq(PingNodeConfig::getTraceroute, true)).stream()
            .map(this::toFirstNodeVo)
            .toList();
    }

    @Override
    public List<PingNodeListedVo> screenList(NodeListQueryDto query) {
        LambdaQueryWrapper<PingNodeConfig> lqw = availableWrapper();
        addScreenConditions(lqw, query);
        return baseMapper.selectList(lqw).stream().map(this::toListedVo).toList();
    }

    @Override
    public List<PingNodeListedVo> screenIpv6List(NodeListQueryDto query) {
        LambdaQueryWrapper<PingNodeConfig> lqw = availableWrapper().eq(PingNodeConfig::getIpv6, true);
        addScreenConditions(lqw, query);
        return baseMapper.selectList(lqw).stream().map(this::toListedVo).toList();
    }

    @Override
    public PingNodeInfoVo infoByIp(String ip) {
        if (StringUtils.isBlank(ip)) {
            return null;
        }
        PingNodeConfig node = baseMapper.selectOne(Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getState, ENABLED_STATE)
            .eq(PingNodeConfig::getIp, ip)
            .last("limit 1"));
        return toInfoVo(node);
    }

    @Override
    public PingNodeInfoVo infoByUuid(String uuid) {
        if (StringUtils.isBlank(uuid)) {
            return null;
        }
        PingNodeConfig node = baseMapper.selectOne(Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getState, ENABLED_STATE)
            .eq(PingNodeConfig::getUuid, uuid)
            .last("limit 1"));
        if (node == null) {
            log.info("ping 1.0 node not found by uuid: {}", uuid);
            return null;
        }
        return toInfoVo(node);
    }

    @Override
    public boolean closeByQueueUuid(String uuid) {
        if (StringUtils.isBlank(uuid)) {
            return false;
        }
        PingNodeConfig node = baseMapper.selectOne(Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getQueue, uuid)
            .last("limit 1"));
        if (node == null) {
            return false;
        }
        node.setRqState(DISABLED_STATE);
        return baseMapper.updateById(node) > 0;
    }

    private LambdaQueryWrapper<PingNodeConfig> buildQueryWrapper(PingNodeConfigBo bo) {
        LambdaQueryWrapper<PingNodeConfig> lqw = Wrappers.lambdaQuery();
        lqw.orderByDesc(PingNodeConfig::getWeight);
        lqw.orderByAsc(PingNodeConfig::getId);
        lqw.like(StringUtils.isNotBlank(bo.getName()), PingNodeConfig::getName, bo.getName());
        lqw.eq(StringUtils.isNotBlank(bo.getCountry()), PingNodeConfig::getCountry, bo.getCountry());
        lqw.eq(StringUtils.isNotBlank(bo.getOverseas()), PingNodeConfig::getOverseas, bo.getOverseas());
        lqw.eq(StringUtils.isNotBlank(bo.getRegion()), PingNodeConfig::getRegion, bo.getRegion());
        lqw.eq(StringUtils.isNotBlank(bo.getProvince()), PingNodeConfig::getProvince, bo.getProvince());
        lqw.like(StringUtils.isNotBlank(bo.getCity()), PingNodeConfig::getCity, bo.getCity());
        lqw.eq(StringUtils.isNotBlank(bo.getOperators()), PingNodeConfig::getOperators, bo.getOperators());
        lqw.like(StringUtils.isNotBlank(bo.getIp()), PingNodeConfig::getIp, bo.getIp());
        lqw.eq(bo.getWeight() != null, PingNodeConfig::getWeight, bo.getWeight());
        lqw.eq(StringUtils.isNotBlank(bo.getState()), PingNodeConfig::getState, bo.getState());
        lqw.eq(StringUtils.isNotBlank(bo.getRqState()), PingNodeConfig::getRqState, bo.getRqState());
        lqw.like(StringUtils.isNotBlank(bo.getExchange()), PingNodeConfig::getExchange, bo.getExchange());
        lqw.like(StringUtils.isNotBlank(bo.getQueue()), PingNodeConfig::getQueue, bo.getQueue());
        lqw.like(StringUtils.isNotBlank(bo.getBinding()), PingNodeConfig::getBinding, bo.getBinding());
        lqw.like(StringUtils.isNotBlank(bo.getSponsorText()), PingNodeConfig::getSponsorText, bo.getSponsorText());
        lqw.like(StringUtils.isNotBlank(bo.getSponsorUrl()), PingNodeConfig::getSponsorUrl, bo.getSponsorUrl());
        lqw.eq(bo.getHomeState() != null, PingNodeConfig::getHomeState, bo.getHomeState());
        lqw.eq(bo.getTraceroute() != null, PingNodeConfig::getTraceroute, bo.getTraceroute());
        lqw.eq(bo.getIpv6() != null, PingNodeConfig::getIpv6, bo.getIpv6());
        lqw.like(StringUtils.isNotBlank(bo.getUuid()), PingNodeConfig::getUuid, bo.getUuid());
        return lqw;
    }

    private LambdaQueryWrapper<PingNodeConfig> availableWrapper() {
        long offlineAfter = Math.max(
            pingProperties.getAgent().getHeartbeatIntervalSeconds() * 2,
            pingProperties.getAgent().getOfflineAfterSeconds()
        );
        long cutoff = Instant.now().getEpochSecond() - offlineAfter;
        return Wrappers.<PingNodeConfig>lambdaQuery()
            .eq(PingNodeConfig::getState, ENABLED_STATE)
            .eq(PingNodeConfig::getRqState, ENABLED_STATE)
            .ge(PingNodeConfig::getOnline, cutoff)
            .orderByDesc(PingNodeConfig::getWeight)
            .orderByAsc(PingNodeConfig::getId);
    }

    private void addScreenConditions(LambdaQueryWrapper<PingNodeConfig> lqw, NodeListQueryDto query) {
        if (query == null) {
            return;
        }
        lqw.in(query.getRegion() != null && !query.getRegion().isEmpty(), PingNodeConfig::getRegion, query.getRegion());
        lqw.in(query.getOperators() != null && !query.getOperators().isEmpty(), PingNodeConfig::getOperators, query.getOperators());
    }

    private void validEntityBeforeSave(PingNodeConfig entity, boolean create) {
        long now = Instant.now().getEpochSecond();
        if (create && entity.getCreateTime() == null) {
            entity.setCreateTime(now);
        }
        if (create || DISABLED_STATE.equals(entity.getState())) {
            entity.setRqState(DISABLED_STATE);
        }
        if (entity.getWeight() == null) {
            entity.setWeight(0L);
        }
        if (StringUtils.isBlank(entity.getExchange())) {
            entity.setExchange(DEFAULT_NODE_EXCHANGE);
        }
        if (create && StringUtils.isBlank(entity.getUuid())) {
            entity.setUuid(UUID.randomUUID().toString());
        }
        if (create && StringUtils.isBlank(entity.getQueue())) {
            entity.setQueue("ping_node_" + entity.getUuid());
        }
        if (create && StringUtils.isBlank(entity.getBinding())) {
            entity.setBinding(entity.getQueue());
        }
        if (entity.getHomeState() == null) {
            entity.setHomeState(false);
        }
        if (entity.getTraceroute() == null) {
            entity.setTraceroute(false);
        }
        if (entity.getIpv6() == null) {
            entity.setIpv6(false);
        }
    }

    private PingNodeListedVo toListedVo(PingNodeConfig node) {
        PingNodeListedVo vo = new PingNodeListedVo();
        vo.setKey(node.getId());
        vo.setRegion(node.getRegion());
        vo.setCity(node.getCity());
        vo.setProvince(node.getProvince());
        vo.setOperators(node.getOperators());
        vo.setName(node.getName());
        vo.setHomeState(node.getHomeState());
        vo.setSponsorText(node.getSponsorText());
        vo.setSponsorUrl(node.getSponsorUrl());
        vo.setContent(node.getContent());
        vo.setContent2(node.getContent2());
        vo.setContent3(node.getContent3());
        vo.setCoordinate(parseCoordinate(node.getCoordinate()));
        vo.setCountry(node.getCountry());
        return vo;
    }

    private PingFirstNodeVo toFirstNodeVo(PingNodeConfig node) {
        PingFirstNodeVo vo = new PingFirstNodeVo();
        PingNodeListedVo listed = toListedVo(node);
        vo.setKey(listed.getKey());
        vo.setRegion(listed.getRegion());
        vo.setCity(listed.getCity());
        vo.setProvince(listed.getProvince());
        vo.setOperators(listed.getOperators());
        vo.setName(listed.getName());
        vo.setHomeState(listed.getHomeState());
        vo.setSponsorText(listed.getSponsorText());
        vo.setSponsorUrl(listed.getSponsorUrl());
        vo.setContent(listed.getContent());
        vo.setContent2(listed.getContent2());
        vo.setContent3(listed.getContent3());
        vo.setCoordinate(listed.getCoordinate());
        vo.setCountry(listed.getCountry());
        vo.setDataValue(List.of());
        return vo;
    }

    private PingNodeInfoVo toInfoVo(PingNodeConfig node) {
        if (node == null) {
            return null;
        }
        PingNodeInfoVo vo = new PingNodeInfoVo();
        vo.setCountry(node.getCountry());
        vo.setOverseas(node.getOverseas());
        vo.setRegion(node.getRegion());
        vo.setProvince(node.getProvince());
        vo.setCity(node.getCity());
        vo.setOperators(node.getOperators());
        vo.setState(node.getState());
        vo.setExchange(node.getExchange());
        vo.setQueue(node.getQueue());
        vo.setBinding(node.getBinding());
        vo.setName(node.getName());
        vo.setIp(node.getIp());
        vo.setSponsorText(node.getSponsorText());
        vo.setSponsorUrl(node.getSponsorUrl());
        vo.setContent(node.getContent());
        vo.setContent2(node.getContent2());
        vo.setContent3(node.getContent3());
        return vo;
    }

    private Object parseCoordinate(String coordinate) {
        if (StringUtils.isBlank(coordinate)) {
            return null;
        }
        try {
            return OBJECT_MAPPER.readValue(coordinate, Object.class);
        } catch (JsonProcessingException ignored) {
            return coordinate;
        }
    }
}
