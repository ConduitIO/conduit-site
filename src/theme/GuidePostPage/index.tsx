/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import Layout from "@theme/Layout";
import BlogPostItem from "@theme/BlogPostItem";
import BlogPostPaginator from "@theme/BlogPostPaginator";
import BlogSidebar from "@theme/BlogSidebar";
import TOC from "@theme/TOC";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { WasThisHelpful } from "was-this-helpful-react";
import ViewCounter from "../../components/ViewCounter";
import {useLocation} from '@docusaurus/router';

function BlogPostPage(props): JSX.Element {
  const location = useLocation();
  const { content: BlogPostContents, sidebar } = props;
  const { frontMatter, metadata } = BlogPostContents;
  const { title, description, nextItem, prevItem } = metadata;
  const { hide_table_of_contents: hideTableOfContents } = frontMatter;

  return (
    <Layout
      title={title}
      description={description}
      wrapperClassName={ThemeClassNames.wrapper.blogPages}
      pageClassName={ThemeClassNames.page.blogPostPage}
    >
      <ViewCounter slug={location.pathname} invisible />
      {BlogPostContents && (
        <div className="container margin-vert--lg">
          <div className="row">
            <aside className="col col--3">
              <BlogSidebar sidebar={sidebar} />
            </aside>
            <main className="col col--7">
              <div className="mt-5 max-w-4xl prose mx-auto">
                <BlogPostItem
                  frontMatter={frontMatter}
                  metadata={metadata}
                  isBlogPostPage
                >
                  <BlogPostContents />
                  {/* <WasThisHelpful feedbackStyle="other" /> */}
                </BlogPostItem>
              </div>
              {(nextItem || prevItem) && (
                <BlogPostPaginator nextItem={nextItem} prevItem={prevItem} />
              )}
            </main>
            {!hideTableOfContents && BlogPostContents.toc && (
              <div className="col col--2">
                <TOC toc={BlogPostContents.toc} />
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default BlogPostPage;
