# LLM Workbench

https://www.llmwb.com/

Supercharged workbench for LLMs. Test prompt templates across different providers using different variables to fill in the templates.

![Screenshot](docs/promptrepo-main.png)

## How is this different

1. Create "templates": messages / raw prompts that use `{{ }}` for denoting variables (Mustache.js)
2. Create "datasets": Create a list of variables that you want to test the templates on.
3. Support all parameters: Be able to input all the parameters available for different APIs as well as on the UI. For example, tools, logit_bias, etc. are all supported.
4. Non chat-completion APIs: If you want to interact with open source models, you may want to use the raw prompts. Create prompts with non chat-completion
5. Default local, optional cloud: Templates / datasets / API keys that you add on the website are only stored in IndexedDB by default. You can also try out other peoples' prompts and datasets created by other people.

## Running locally

Prompt Repo is just a Next.js App. Assuming you have yarn, you can run with the following:

```
yarn
yarn dev
```
