package org.dromara.ping.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.ping.domain.bo.PingNodeConfigBo;
import org.dromara.ping.domain.dto.NodeListQueryDto;
import org.dromara.ping.domain.vo.PingFirstNodeVo;
import org.dromara.ping.domain.vo.PingNodeConfigVo;
import org.dromara.ping.domain.vo.PingNodeInfoVo;
import org.dromara.ping.domain.vo.PingNodeListedVo;

import java.util.Collection;
import java.util.List;

public interface IPingNodeConfigService {

    PingNodeConfigVo queryById(Long id);

    TableDataInfo<PingNodeConfigVo> queryPageList(PingNodeConfigBo bo, PageQuery pageQuery);

    List<PingNodeConfigVo> queryList(PingNodeConfigBo bo);

    Boolean insertByBo(PingNodeConfigBo bo);

    Boolean updateByBo(PingNodeConfigBo bo);

    Boolean deleteWithValidByIds(Collection<Long> ids, Boolean isValid);

    List<PingNodeListedVo> listAvailableNodes();

    List<PingFirstNodeVo> firstList();

    List<PingFirstNodeVo> tracerouteFirstList();

    List<PingFirstNodeVo> ipv6FirstList();

    List<PingFirstNodeVo> ipv6TracerouteFirstList();

    List<PingNodeListedVo> screenList(NodeListQueryDto query);

    List<PingNodeListedVo> screenIpv6List(NodeListQueryDto query);

    PingNodeInfoVo infoByIp(String ip);

    PingNodeInfoVo infoByUuid(String uuid);

    boolean closeByQueueUuid(String uuid);
}
