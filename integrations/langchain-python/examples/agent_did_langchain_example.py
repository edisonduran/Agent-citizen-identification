"""Minimal Agent-DID + LangChain Python assembly example."""

from __future__ import annotations

import asyncio
import os

from agent_did_sdk import AgentIdentity, AgentIdentityConfig, CreateAgentParams
from langchain.agents import create_agent

from agent_did_langchain import create_agent_did_langchain_integration


async def main() -> None:
    signer_address = os.environ.get("AGENT_DID_SIGNER_ADDRESS", "0x8888888888888888888888888888888888888888")
    model = os.environ.get("LANGCHAIN_MODEL", "openai:gpt-4.1-mini")
    identity = AgentIdentity(AgentIdentityConfig(signer_address=signer_address, network="polygon"))

    runtime_identity = await identity.create(
        CreateAgentParams(
            name="research_assistant",
            description="Agente de investigacion con identidad verificable",
            core_model="gpt-4.1-mini",
            system_prompt="Eres un agente de investigacion preciso y trazable.",
            capabilities=["research:web", "report:write"],
        )
    )

    integration = create_agent_did_langchain_integration(
        agent_identity=identity,
        runtime_identity=runtime_identity,
        expose={"sign_http": True},
        additional_system_context="Never sign arbitrary payloads.",
    )

    agent = create_agent(
        model=model,
        tools=integration.tools,
        system_prompt=integration.compose_system_prompt(
            "Responde con precision y usa herramientas solo cuando aporten evidencia verificable."
        ),
    )

    result = await agent.ainvoke(
        {
            "messages": [
                {
                    "role": "user",
                    "content": "Muestrame tu DID actual y explica cuando deberias usar la firma HTTP.",
                }
            ]
        }
    )
    print(result)


if __name__ == "__main__":
    asyncio.run(main())
