import { createClient } from '@prismicio/client';

const {
  PRISMIC_BASE_URL: baseUrl,
  PRISMIC_REPO: repo,
  PRISMIC_API_TOKEN: accessToken,
} = process.env;

/**
 * Run a GraphQL query against our Prismic repo
 * @param query GraphQL query to run
 * @param variables Variables for query
 * @returns Result as given generic type T
 */
export async function fetchFromPrismic<T>(
  query: string,
  variables: Record<string, string> = {},
): Promise<T> {
  if (!baseUrl || !repo || !accessToken) {
    throw new Error('missing prismic config');
  }

  const serializedVariables = encodeURIComponent(JSON.stringify(variables));
  let result = null;

  const client = createClient(repo, {
    accessToken,
  });
  const ref = await client.getMasterRef();
  const headers = {
    'Prismic-Ref': ref.ref,
    authorization: `Token ${accessToken}`,
  };

  try {
    result = await fetch(
      `${baseUrl}?query=${query}&variables=${serializedVariables}`,
      { method: 'GET', headers },
    );
  } catch (e) {
    console.error('Error fetching', e);
    throw e;
  }

  if (!result.ok) {
    console.info(await result.text());
    throw new Error(`Error fetching, non 200 status: ${result.status}`);
  }

  const json = await result.json();

  return json.data as T;
}
