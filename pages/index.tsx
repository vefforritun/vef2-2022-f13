/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import { asText } from '@prismicio/helpers';
import { fetchFromPrismic } from '../api/prismic';
import { News } from '../types';

type Props = {
  allNews?: Array<{
    node?: News | undefined;
  }>;
}

function NewsContainer({ news }: {
  news: Array<{
    node?: News | undefined;
  }>
}) {
  return (
    <ul>
      {news.map((item, i) => {
        const title = asText(item.node?.title);
        const uid = item?.node?._meta?.uid;

        if (!title || !uid) {
          return null;
        }

        return (
          <li key={i}>
            <Link href={`/${uid}`}>
              {title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function Home({ allNews }: Props) {
  return (
    <section>
      <h1>Fréttir</h1>
      <NewsContainer news={allNews ?? []} />
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

export async function getServerSideProps() {
  const result = await fetchFromPrismic<PrismicResponse>(query);

  const allNews = result.allNewss?.edges;

  return {
    props: { allNews },
  };
}
