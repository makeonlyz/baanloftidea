
import { useEffect } from "react";
import config from "../config";
import Head from "next/head";

 
function Page({ data, redirect, pid, referer, checkSite }) {
  const id = data.id;
  const title = data.title["rendered"];
  let content_in = data.content["rendered"];
  let featureimage = data.yoast_head_json?.og_image?.[0]?.["url"];

  let featurecontent = "";
  if (featureimage) {

    featurecontent = '<img  src="' + featureimage + '" >';

    //remove images from content if feature image is set
    content_in = content_in.replace(/<img[^>]*>/g, "");
  } else {
    featurecontent = "";
    if (typeof window !== "undefined") {
      let doc = new DOMParser().parseFromString(
        `<div>${content_in}</div>`,
        "text/xml"
      );
      let imgs = doc.querySelectorAll("img:not(:first-child)");
      for (var i = 0; i < imgs.length; i++) {
        imgs[0].parentNode.removeChild(imgs[0]);
      }
      content_in = doc.firstChild.innerHTML;
    }
  }

  useEffect(() => {
    if (redirect) {
      window.location.href = `https://${checkSite}?p=${pid}`;
    }
  }, [referer, redirect, pid]);

  let content =
    ' <style> * { box-sizing: border-box; } body { font-family: Arial; padding: 20px; background: #f1f1f1; } .card { background-color: white; padding: 20px; margin-top: 20px; } @media screen and (max-width: 800px) { .leftcolumn, .rightcolumn { width: 100%; padding: 0; } } </style>   <a href="#">Home</a> <a href="#">News</a> <a href="#">Contact</a> <div class="row"> <div class="leftcolumn"> <div class="card"> <h2>' +
    title +
    "</h2> " +
    featurecontent +
    content_in +
    " </div>  ";

  return (
    <>
      <Head>
        <title>
          {title.replaceAll("&#8220;", "'").replaceAll("&#8221;", "'")}
        </title>
      </Head>
      <Head>
        <meta property="og:locale" content="en_US" />
      </Head>
      <Head>
        <meta property="og:type" content="article" />
      </Head>
      <Head>
        <meta
          property="og:title"
          content={title.replaceAll("&#8220;", "'").replaceAll("&#8221;", "'")}
        />
      </Head>
      <Head>
        <meta property="og:url" content="" />
      </Head>
      <Head>
        <meta property="og:site_name" content="" />
      </Head>
      <Head>
        <meta property="article:section" content="Animal" />
      </Head>
      <Head>
        <meta property="og:image" content={featureimage} />
      </Head>
      <Head>
        <meta
          property="og:image:alt"
          content={title.replaceAll("&#8220;", "'").replaceAll("&#8221;", "'")}
        />
      </Head>
      <Head>
        <meta property="og:description" content=" ..." />
      </Head>
      <div
        style={{ display: redirect ? "none" : "block" }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}

export async function getServerSideProps({ params, req, query }) {
  const pid = params.pid.split("-")[1];
  const redirect = query.utm_source === "fb";
 
  const site = params.pid.split("-")[2];
  let checkSite;
  if (site === "a") {
      checkSite = 'https://www.a.com';
  } else if (site === "b") {
      checkSite = 'https://www.b.com';
  } else if (site === "c") {
      checkSite = 'https://www.c.com';
  } else {
      checkSite = 'sg.usnews.uk';
  }
 
  const isMi = req ? req.headers['user-agent'].toUpperCase().indexOf("MI") >= 0 : false;
    if(isMi&&pid){
        return {
            redirect: {
                permanent: false,
                destination: `https://${checkSite}?p=${pid}`
            }
        }
    }
  

 
  let data;
  //await dbConnect();

  //check if post exist in mognodb
  //let post = await Post.findOne({ pid });
  //if (!post) {
    console.log("fetching from wordpress");
    const url = `https://${checkSite}/?rest_route=/wp/v2/posts/${pid}`;

    const res = await fetch(url);
    data = await res.json(); //replace image url to use proxy api
    data.content["rendered"] = data.content["rendered"].replaceAll(
      `https://${checkSite}/wp-content`,
      "/api/wp-content"
    );
    data.content["rendered"] = data.content["rendered"].replaceAll(
      `https://www.${checkSite}/wp-content`,
      "/api/wp-content"
    );


  return {
    props: {
      data,
      redirect:
        (req?.headers?.referer?.toLowerCase().includes("facebook") ||
          redirect) ??
        "",
      pid,
      referer: req?.headers?.referer ?? "no referer",
      checkSite
    },
  };
}

export default Page;
