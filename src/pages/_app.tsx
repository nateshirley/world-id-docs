import 'styles/global.css'
import { MDXProvider } from '@mdx-js/react'
import slugify from '@sindresorhus/slugify'
import { Fragment, ReactNode, useMemo } from 'react'
import { AppProps } from 'next/app'
import { Layout } from 'Layout'
import { collectHeadings } from 'common/helpers/collecting-headings'
import { renderToString } from 'react-dom/server'
import parse from 'node-html-parser'
import { findPageTitle } from 'common/helpers/find-page-title'
import { findPageDescription } from 'common/helpers/find-page-description'
import { Fence } from 'common/Fence'
import { CodeBlock } from 'common/CodeBlock'
import { Link } from 'common/Link'
import { ThemeProvider } from 'common/contexts/ThemeContext'
import { useRouter } from 'next/router'

const components = {
  h2: (props: { children?: ReactNode }) => (
    <h2 className="" id={slugify(props.children as string)}>
      {props.children}
    </h2>
  ),

  h3: (props: { children?: ReactNode }) => (
    <h3 id={slugify(props.children as string)}>{props.children}</h3>
  ),
  pre: Fence,
  code: CodeBlock,
  a: Link,
}

export default function MyApp(pageProps: AppProps) {
  const router = useRouter()

  const pageContent = useMemo(
    () => <pageProps.Component {...pageProps} />,
    [pageProps]
  )

  const pageHtml = parse(renderToString(pageContent))
  const tableOfContents = collectHeadings(pageHtml)
  const pageTitle = findPageTitle(pageHtml)
  const pageDescription = findPageDescription(pageHtml)
  const isUsePage = useMemo(() => router.pathname === '/use', [router.pathname])

  return (
    <ThemeProvider>
      <MDXProvider components={components}>
        {!isUsePage && (
          <Layout
            title={pageTitle}
            description={pageDescription}
            tableOfContents={tableOfContents}
          >
            {pageContent}
          </Layout>
        )}

        {isUsePage && <pageProps.Component {...pageProps} />}
      </MDXProvider>
    </ThemeProvider>
  )
}
