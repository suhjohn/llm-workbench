import { TogetherProvider } from "../providers";

export const TogetherZeroOneAI_Yi_34B = {
  id: "f9da5077-c031-4a28-b443-0e754d4e6a34",
  name: "zero-one-ai/Yi-34B-Chat",
  readableName: "01-ai Yi Chat 34B",
  description: `🤖 The Yi series models are the next generation of open-source large language models trained from scratch by 01.AI.`,
  contextWindow: 4096,
  inputTokenCost: 0.8,
  outputTokenCost: 0.8,
  providerId: TogetherProvider.id,
};

export const TogetherOLMO7B = {
  id: "7c9860fa-5370-4971-81eb-b0a1ba6277aa",
  name: "allenai/OLMo-7B-Instruct	",
  readableName: "OLMO-7B Instruct",
  description: `OLMo is a series of Open Language Models designed to enable the science of language models. The OLMo base models are trained on the Dolma dataset. The adapted versions are trained on the Tulu SFT mixture and, for the Instruct version, a cleaned version of the UltraFeedback dataset. We release all code, checkpoints, logs (coming soon), and details involved in training these models.`,
  contextWindow: 2048,
  inputTokenCost: 0.2,
  outputTokenCost: 0.2,
  providerId: TogetherProvider.id,
};

export const TogetherDolphinMixtral8x7B = {
  id: "8a0eda68-0f8b-4ad4-b5d8-8f51f648f86b",
  name: "cognitivecomputations/dolphin-2.5-mixtral-8x7b",
  readableName: "Dolphin 2.5 Mixtral 8x7b",
  description: `This model's training was sponsored by convai.
  This model is based on Mixtral-8x7b.
  The base model has 32k context, I finetuned it with 16k.
  This Dolphin is really good at coding, I trained with a lot of coding data. It is very obedient but it is not DPO tuned - so you still might need to encourage it in the system prompt as I show in the below examples.`,
  contextWindow: 32768,
  inputTokenCost: 0.6,
  outputTokenCost: 0.6,
  providerId: TogetherProvider.id,
};

export const TogetherDBRXInstruct = {
  id: "b03e300d-9aef-4df6-902f-42a0855b9b11",
  name: "databricks/dbrx-instruct	",
  readableName: "DBRX Instruct",
  description: `DBRX Instruct is a mixture-of-experts (MoE) large language model trained from scratch by Databricks. DBRX Instruct specializes in few-turn interactions.`,
  contextWindow: 32768,
  inputTokenCost: 0.6,
  outputTokenCost: 0.6,
  providerId: TogetherProvider.id,
};

export const TogetherLlama2_13B = {
  id: "e4c693da-8464-4d66-8907-f6261a32d5ab",
  name: "meta-llama/Llama-2-13b-chat-hf",
  readableName: "Llama-2 13B",
  description: `Meta developed and publicly released the Llama 2 family of large language models (LLMs), a collection of pretrained and fine-tuned generative text models ranging in scale from 7 billion to 70 billion parameters. Our fine-tuned LLMs, called Llama-2-Chat, are optimized for dialogue use cases. Llama-2-Chat models outperform open-source chat models on most benchmarks we tested, and in our human evaluations for helpfulness and safety, are on par with some popular closed-source models like ChatGPT and PaLM.`,
  contextWindow: 4096,
  inputTokenCost: 0.3,
  outputTokenCost: 0.3,
  providerId: TogetherProvider.id,
};

export const TogetherLlama3_8B = {
  id: "15dfdfde-b000-4e7a-9ee0-0a4a3470b911",
  name: "meta-llama/Llama-3-8b-chat-hf",
  readableName: "Llama-3 8B",
  description: `Meta developed and released the Meta Llama 3 family of large language models (LLMs), a collection of pretrained and instruction tuned generative text models in 8 and 70B sizes. The Llama 3 instruction tuned models are optimized for dialogue use cases and outperform many of the available open source chat models on common industry benchmarks. Further, in developing these models, we took great care to optimize helpfulness and safety.`,
  contextWindow: 8000,
  inputTokenCost: 0.2,
  outputTokenCost: 0.2,
  providerId: TogetherProvider.id,
};

export const TogetherLlama3_70B = {
  id: "8d972d12-bd33-4a68-81d0-564ae88f0cad",
  name: "meta-llama/Llama-3-70b-chat-hf",
  readableName: "Llama-3 70B",
  description: `Meta developed and released the Meta Llama 3 family of large language models (LLMs), a collection of pretrained and instruction tuned generative text models in 8 and 70B sizes. The Llama 3 instruction tuned models are optimized for dialogue use cases and outperform many of the available open source chat models on common industry benchmarks. Further, in developing these models, we took great care to optimize helpfulness and safety.`,
  contextWindow: 8000,
  inputTokenCost: 0.9,
  outputTokenCost: 0.9,
  providerId: TogetherProvider.id,
};

export const TogetherMistralMedium = {
  id: "4e9253a1-63ad-43d8-8c3d-7aa94a912e6d",
  name: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  readableName: "Mistral Medium",
  description: ``,
  contextWindow: 32768,
  inputTokenCost: 0.6,
  outputTokenCost: 0.6,
  providerId: TogetherProvider.id,
};

export const TogetherMistralLarge = {
  id: "9d7217e8-758d-454d-84d3-240c1e50b99b",
  name: "mistralai/Mixtral-8x22B-Instruct-v0.1",
  readableName: "Mistral Large",
  description: ``,
  contextWindow: 65536,
  inputTokenCost: 1.2,
  outputTokenCost: 1.2,
  providerId: TogetherProvider.id,
};

export const TogetherNousHermes2Yi_34B = {
  id: "7e2c6c8a-1e6b-4b9b-8e7f-2d0e5b0f5e9e",
  name: "NousResearch/Nous-Hermes-2-Yi-34B",
  readableName: "NousResearch Hermes 2 Yi 34B",
  description: `Nous Hermes 2 - Yi-34B is a state of the art Yi Fine-tune.

  Nous Hermes 2 Yi 34B was trained on 1,000,000 entries of primarily GPT-4 generated data, as well as other high quality data from open datasets across the AI landscape.`,
  contextWindow: 4096,
  inputTokenCost: 0.8,
  outputTokenCost: 0.8,
  providerId: TogetherProvider.id,
};

export const TogetherModels = [
  TogetherZeroOneAI_Yi_34B,
  TogetherOLMO7B,
  TogetherDolphinMixtral8x7B,
  TogetherDBRXInstruct,
  TogetherLlama2_13B,
  TogetherLlama3_8B,
  TogetherLlama3_70B,
  TogetherMistralMedium,
  TogetherMistralLarge,
  TogetherNousHermes2Yi_34B,
];
