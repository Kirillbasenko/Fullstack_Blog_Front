import Head from 'next/head'

import { useSelector } from 'react-redux'


import Profile from "@/components/profile/Profile"

const ProfilePage = () => {
   const {user} = useSelector(state => state.user)
   return(
      <>
         <Head>
            <title>{user.name}`s Profile</title>
            <meta name="description" content="Generated by create next app" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
         </Head>
         <Profile/>
      </>
   )
}

export default ProfilePage