import React, { useEffect } from 'react';
import useSWR from 'swr';

async function fetcher(...args) {
  const res = await fetch(...args);

  return res.json();
}

export default function ViewCounter({ slug, invisible }) {
  return <></>
  // const { data } = useSWR(`/views-get?slug=${slug}`, fetcher);
  // const views = new Number(data?.total);

  // useEffect(() => {
  //   const registerView = () =>
  //     fetch(`/views-collect`, {
  //       method: 'POST',
  //       body: JSON.stringify({slug}),
  //     });

  //   registerView();
  // }, [slug]);

  // if (invisible) return <></>;

  // return <>`${views > 0 ? views.toLocaleString() : '–––'} views`</>;
}