import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const client = new InferenceClient(process.env.HF_TOKEN);

async function run() {
  try {
    const output = await client.summarization({
      model: "facebook/bart-large-cnn",
      inputs: "The Eiffel Tower is 324 metres tall and was the tallest structure in Paris for 41 years."
    });
    console.log("Summary:", output[0].summary_text);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();