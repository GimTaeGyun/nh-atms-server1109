package kr.co.nh.atms.web.agent;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/** 옛 에이전트 경로 → atms-journal 새 경로 변환 (WebtoB 경유 시 무한 루프 방지의 핵심). */
class LegacyAgentGatewayControllerTest {

    @Test
    void mapsKnownLegacyPathsToApiAgentLegacy() {
        assertThat(LegacyAgentGatewayController.toJournalPath("/atms/agent/open.do")).isEqualTo("/api/agent/legacy/open");
        assertThat(LegacyAgentGatewayController.toJournalPath("/atmr/agent/open.do")).isEqualTo("/api/agent/legacy/open");
        assertThat(LegacyAgentGatewayController.toJournalPath("/atms/agent/exit.do")).isEqualTo("/api/agent/legacy/exit");
        assertThat(LegacyAgentGatewayController.toJournalPath("/atmr/agent/put.jnl.mode.do")).isEqualTo("/api/agent/legacy/put-jnl-mode");
        assertThat(LegacyAgentGatewayController.toJournalPath("/atms/remote-exec/put.jnl.mode.do")).isEqualTo("/api/agent/legacy/put-jnl-mode");
        assertThat(LegacyAgentGatewayController.toJournalPath("/atms/agent/put.jnl.data.do")).isEqualTo("/api/agent/legacy/put-jnl-data");
    }

    @Test
    void unknownPathsAreNotForwarded() {
        // 표에 없는 경로를 그대로 보내면 WebtoB 가 다시 atms-web 으로 돌려보내 루프가 된다
        assertThat(LegacyAgentGatewayController.toJournalPath("/atmr/agent/ping.do")).isNull();
        assertThat(LegacyAgentGatewayController.toJournalPath("/atms/remote-exec/put.msg.resp.do")).isNull();
        assertThat(LegacyAgentGatewayController.toJournalPath("/api/agent/legacy/open")).isNull();
        assertThat(LegacyAgentGatewayController.toJournalPath(null)).isNull();
    }
}
