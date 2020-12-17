import { setCookie, parseCookies } from "nookies";
import getConfig from "next/config";
import Image from "next/image";

import Layout from "src/containers/Layout/Layout";
import spotifyRedirect from "src/spotify";
import { fetcher } from "src/hooks/useFetch";

const Auth = () => {
  return (
    <Layout>
      <h2 className=" text-md text-txt text-center capitalize mt-4">
        for your experience
      </h2>
      <div className="w-max m-auto">
        <Image 
          src="/images/spotify-seeklogo.com.svg"
          alt="spotify logo"
          height={70}
          width={70} />
      </div>
      <p className="w-2/4 mt-4 text-sm m-auto text-center text-txt">
      For the best possible user experience we reccomend allowing us to access your spotify profile.
      This includes info such as your personal playlists and most listened to track.
    </p>
    <div className="h-0.5 w-3/5 bg-pri my-4" />
    <p className="w-2/4 mb-8 text-sm text-center m-auto text-txt">
      Then we can personalize your experince to bring you the tracks and artists you love.
    </p>
    <button
      role="link"
      onClick={() => document.location.href = spotifyRedirect}
      className="w-2/5 m-auto block text-xs text-txt uppercase text-center bg-pri px-4 my-2 md:px-6 py-2 border border-light-text rounded transition duration-150 ease-in text-light-text hover:bg-light-bg hover:text-light-text">
        Allow us to access your spotify information
      </button>
    </Layout>
  )
};

export async function getServerSideProps(ctx) {
  const { publicRuntimeConfig } = getConfig();
  const { query: { code }} = ctx;

  if (parseCookies(ctx).spaccess) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false
      }
   }
  }
  
  if (!code) {
    return {
      props: {}
    }
  }
    else {
      const queryString = require("query-string");

      const postOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: queryString.stringify({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: "http://localhost:3000/dashboard/auth/",
          client_id: publicRuntimeConfig.SPOTIFY_CLIENT_ID,
          client_secret: publicRuntimeConfig.SPOTIFY_CLIENT_SECRET,
        })
      };

      const postTokenSpotify = await fetcher(`${publicRuntimeConfig.SPOTIFY_AUTH_API}/api/token`, postOptions);

      setCookie(ctx, "sprefresh", postTokenSpotify.refresh_token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
      });

      setCookie(ctx, "spaccess", postTokenSpotify.access_token, {
        maxAge: 3600,
        path: '/'
      });

      return {
        redirect: {
          destination: "/dashboard",
          permanent: false
        }
        }
      }
};

export default Auth;