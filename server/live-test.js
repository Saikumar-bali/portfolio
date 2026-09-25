import { callSystemone } from './jev-client.js';

async function main() {
  const result = await callSystemone({
    model: 'jev-latest',
    state: 'My payment failed. Please help.',
    questions: { urgent: { type: 'noul', instructions: 'Does this message need urgent support?' } },
  });
  console.log(JSON.stringify(result, null, 2));
  console.log('\n--- Verification ---');
  console.log('answers.urgent.noul:', result.answers?.urgent?.noul);
  console.log('usage:', result.usage);
  console.log('model:', result.model);
}
main();
