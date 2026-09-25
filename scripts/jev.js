import { callSystemone } from '../server/jev-client.js';

const args = process.argv.slice(2);
const text = args.find((a) => !a.startsWith('--'));
const model = args.find((a) => a.startsWith('--model='))?.split('=')[1] || 'jev-latest';
const question = args.find((a) => a.startsWith('--question='))?.split('=')[1] || 'Does this need urgent support?';

if (!text) {
  console.error('Usage: node scripts/jev.js "<text>" [--model=jev-latest] [--question="..."]');
  process.exit(1);
}

async function main() {
  const result = await callSystemone({
    model,
    state: text,
    questions: { urgent: { type: 'noul', instructions: question } },
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
