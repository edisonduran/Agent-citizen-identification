"use strict";

const MICROSOFT_AGENT_FRAMEWORK_INTEGRATION_STATUS = "sdk-ready-scaffold";

function createAgentDidMicrosoftAgentFrameworkIntegration() {
  throw new Error(
    "The Microsoft Agent Framework integration remains scaffold-only, but it is no longer blocked by SDK availability. The stable public documentation still emphasizes Python and C# surfaces; see the package README plus the implementation and review checklists for architecture notes and delivery criteria."
  );
}

module.exports = {
  MICROSOFT_AGENT_FRAMEWORK_INTEGRATION_STATUS,
  createAgentDidMicrosoftAgentFrameworkIntegration,
};