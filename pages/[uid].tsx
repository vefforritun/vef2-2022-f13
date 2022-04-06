import { PrismicRichText } from '@prismicio/react';
import { asText } from '@prismicio/helpers';
import { fetchFromPrismic } from '../api/prismic';
import { News } from '../types';

type Props = {
  news: News | undefined;
}

export default function Home({ news }: Props) {
  return (
    <section>
      <h1>{asText(news?.title)}</h1>
      {news?.authors && (<div>
        {JSON.stringify(news.authors)}
      </div>)}
      <div>
        <PrismicRichText field={news?.content} />
      </div>
    </section>
  );
}

const query = `
fragment news on News {
  _meta {
    uid
  }
  title
  date
  content
  authors {
    author {
      ... on Person {
        name
      }
    }
  }
}

query($uid: String = "") {
  news(uid: $uid, lang: "is") {
    ...news
  }
  allNewss(sortBy: date_DESC, first: 20) {
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        ...news
      }
    }
  }
}
`;

type PrismicResponse = {
  news?: News;
  allNewss?: {
    edges?: Array<{
      node?: News;
    }>;
  }
}

// Ætti ekki að vera any hér
export async function getServerSideProps({ params }: any) {
  const { uid } = params;
  const result = await fetchFromPrismic<PrismicResponse>(query, { uid });

  const news = result.news ?? null;

  if (!news) {
    return {
      notFound: true,
      props: {},
    };
  }

  return {
    props: { news },
  };
}
