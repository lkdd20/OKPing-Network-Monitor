package org.dromara.ping.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.ping.domain.PingMilestone;
import org.dromara.ping.domain.vo.PingPublicMilestoneVo;
import org.dromara.ping.mapper.PingMilestoneMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class PingMilestoneServiceImplTest {

    @Mock
    private PingMilestoneMapper baseMapper;

    private PingMilestoneServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PingMilestoneServiceImpl(baseMapper);
    }

    @Test
    void normalizeBeforeSaveSanitizesTextAndNormalizesMonth() {
        PingMilestone milestone = new PingMilestone();
        milestone.setMilestoneDate(LocalDate.of(2026, 8, 24));
        milestone.setContent(" <b>新增 DNS 工具</b> ");
        milestone.setRemark("<script>alert(1)</script>后台备注");
        milestone.setStatus("on");

        service.normalizeBeforeSave(milestone);

        assertThat(milestone.getMilestoneDate()).isEqualTo(LocalDate.of(2026, 8, 1));
        assertThat(milestone.getContent()).isEqualTo("新增 DNS 工具");
        assertThat(milestone.getRemark()).isEqualTo("后台备注");
        assertThat(milestone.getSortOrder()).isZero();
    }

    @Test
    void normalizeBeforeSaveRejectsUnknownStatus() {
        PingMilestone milestone = new PingMilestone();
        milestone.setMilestoneDate(LocalDate.of(2026, 8, 1));
        milestone.setContent("新增工具");
        milestone.setStatus("published");

        assertThatThrownBy(() -> service.normalizeBeforeSave(milestone))
            .isInstanceOf(ServiceException.class)
            .hasMessageContaining("仅支持开启或关闭");
    }

    @Test
    void publicVoContainsChineseYearAndMonth() {
        PingMilestone milestone = new PingMilestone();
        milestone.setId(7L);
        milestone.setMilestoneDate(LocalDate.of(2025, 4, 1));
        milestone.setContent("项目能力升级");

        PingPublicMilestoneVo result = service.toPublicVo(milestone);

        assertThat(result.getId()).isEqualTo(7L);
        assertThat(result.getYear()).isEqualTo("2025");
        assertThat(result.getMonth()).isEqualTo("4月");
        assertThat(result.getContent()).isEqualTo("项目能力升级");
    }
}
