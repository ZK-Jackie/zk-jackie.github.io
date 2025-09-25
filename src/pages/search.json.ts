import {SearchIndex} from '@components/search/searchIndex';

export async function GET() {
  const index = (await new SearchIndex().index()).getIndexData()

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
