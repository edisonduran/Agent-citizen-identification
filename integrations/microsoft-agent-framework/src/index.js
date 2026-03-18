"use strict";

const MICROSOFT_AGENT_FRAMEWORK_INTEGRATION_STATUS = "design-scaffold";

function createAgentDidMicrosoftAgentFrameworkIntegration() {
  throw new Error(
    "The Microsoft Agent Framework integration is still in design. The stable public documentation currently emphasizes Python and C# surfaces; see the package README for architecture notes and implementation constraints."
  );
}

module.exports = {
  MICROSOFT_AGENT_FRAMEWORK_INTEGRATION_STATUS,
  createAgentDidMicrosoftAgentFrameworkIntegration,
};