package org.dromara.ping.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import org.dromara.ping.domain.PingIpFeedback;
import org.dromara.ping.domain.vo.PingPublicIpFeedbackPageVo;
import org.dromara.ping.mapper.PingIpFeedbackMapper;
import org.dromara.ping.service.IPingIpRegionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingIpFeedbackServiceImplTest {

    @Mock
    private PingIpFeedbackMapper feedbackMapper;

    @Mock
    private IPingIpRegionService ipRegionService;

    private PingIpFeedbackServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PingIpFeedbackServiceImpl(feedbackMapper, ipRegionService);
    }

    @Test
    @SuppressWarnings("unchecked")
    void publicPageCountsIpRangesAndMasksUnreviewedLocations() {
        PingIpFeedback pending = feedback(1L, "43.228.71.0", "43.228.71.255", "中国|四川省|成都市", "pending");
        PingIpFeedback approved = feedback(2L, "45.93.31.174", "45.93.31.174", "韩国|首尔", "approved");
        Page<PingIpFeedback> page = new Page<>(1, 6);
        page.setRecords(List.of(pending, approved));
        page.setTotal(2);

        when(feedbackMapper.selectPage(any(Page.class), any(LambdaQueryWrapper.class))).thenReturn(page);
        when(feedbackMapper.selectList(any(LambdaQueryWrapper.class)))
            .thenReturn(List.of(pending, approved), List.of(approved));

        PingPublicIpFeedbackPageVo result = service.queryPublicPage("", 1, 6);

        assertThat(result.getSubmittedIpCount7d()).isEqualTo("257");
        assertThat(result.getUpdatedIpCount7d()).isEqualTo("1");
        assertThat(result.getRows()).hasSize(2);
        assertThat(result.getRows().get(0).getSubmittedLocation()).isNull();
        assertThat(result.getRows().get(0).getActualLocation()).isNull();
        assertThat(result.getRows().get(1).getSubmittedLocation()).isEqualTo("韩国|首尔");
        assertThat(result.getRows().get(1).getActualStartIp()).isEqualTo("45.93.31.174");
    }

    @Test
    @SuppressWarnings("unchecked")
    void publicSearchMatchesIpInsideSubmittedRange() {
        PingIpFeedback matching = feedback(1L, "61.241.54.0", "61.241.54.255", "中国|广东省|深圳市|联通", "approved");
        PingIpFeedback other = feedback(2L, "8.8.8.0", "8.8.8.255", "美国|加利福尼亚", "approved");
        when(feedbackMapper.selectList(any(LambdaQueryWrapper.class)))
            .thenReturn(List.of(matching, other), List.of(), List.of());

        PingPublicIpFeedbackPageVo result = service.queryPublicPage("61.241.54.211", 1, 6);

        assertThat(result.getTotal()).isOne();
        assertThat(result.getRows()).singleElement().satisfies(item -> {
            assertThat(item.getStartIp()).isEqualTo("61.241.54.0");
            assertThat(item.getEndIp()).isEqualTo("61.241.54.255");
        });
    }

    private PingIpFeedback feedback(Long id, String startIp, String endIp, String location, String status) {
        PingIpFeedback feedback = new PingIpFeedback();
        feedback.setId(id);
        feedback.setIpVersion("ipv4");
        feedback.setStartIp(startIp);
        feedback.setEndIp(endIp);
        feedback.setLocation(location);
        feedback.setStatus(status);
        return feedback;
    }
}
