import Posts from "../main/post/Posts"
import Profile from "../main/ProfileWindow"
import RecommendationList from "../main/recommendation/RecommendationList"
import CreatePost from "../main/CreatePost"
import Tags from "../main/TagsWindow"

import { checkUser } from '@/http/userApi'
import { fetchPosts } from "@/http/postApi"

import { useRouter } from "next/router"

import { setAllPosts, setActiveDop, setPosts } from "@/store/slices/postSlice"

import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from "react"
import { setUser } from "@/store/slices/userSlice"

import Grid from '@mui/material/Grid';

const Main = () => {
   const dispatch = useDispatch()
   const router = useRouter()

   const [arr, setArr] = useState([])
   const [current, setCurrent] = useState(0)
   const [fetching, setFetching] = useState(true)
   const [width, setWidth] = useState(null)

   const {user} = useSelector(state => state.user)

   useEffect(() => {
      checkUser(JSON.parse(localStorage.getItem("user"))).then(data => dispatch(setUser(data)))
      if(!JSON.parse(localStorage.getItem("user"))){
         router.push("/AuthPage")
      }
   }, [])

   const fetchPostsStart = () => {
      fetchPosts(6, 1).then(data => {
         setArr([...data.posts])
         dispatch(setAllPosts(data.current))
         dispatch(setPosts([...data.posts]))
         dispatch(setActiveDop(null))
         setFetching(false)
      })
      .finally(() => {
         setCurrent(2)
      })
   }

   useEffect(() => {
      setWidth(window.innerWidth);
   }, []);

   useEffect(() => {
      const handleResize = () => {
         setWidth(window.innerWidth);
      };

      window.addEventListener('resize', handleResize);

      return () => {
         window.removeEventListener('resize', handleResize);
      };
   }, []);

   let ui = () => {
      if(width > 992){
         return(
            <Grid container spacing={2} >
               <Grid item xs={3}>
                  <Grid>
                     <Profile user={user}/>
                  </Grid>
                  <Grid>
                     <RecommendationList/>
                  </Grid>
               </Grid>
               <Grid item xs={7}>
                  <Grid>
                     <CreatePost fetchPostsStart={fetchPostsStart} user={user}/>
                  </Grid>
                  <Grid>
                     <Posts arrStart={arr} currentStart={current} fetchingStart={fetching}/>
                  </Grid>
               </Grid>
               <Grid item xs={2}>
                  {width > 992 ? <Tags fetchPostsStart={fetchPostsStart}/> : null}
               </Grid>
            </Grid>
         )
      }else if(width > 768){
         return(
            <Grid container spacing={2}>
               <Grid item xs={3}>
                  <Grid>
                     <Profile user={user}/>
                  </Grid>
                  <Grid>
                     <RecommendationList/>
                  </Grid>
               </Grid>
               <Grid item xs={9}>
                  <Grid>
                     <CreatePost user={user}/>
                  </Grid>
                  <Grid>
                     <Posts arrStart={arr} currentStart={current} fetchingStart={fetching}/>
                  </Grid>
               </Grid>
            </Grid>
         )
      }else if(width < 768){
         return(
            <Grid container spacing={2}>
               <Grid item xs={12}>
                  <Grid>
                     <Profile user={user}/>
                  </Grid>
                  <Grid>
                     <CreatePost user={user}/>
                  </Grid>
                  <Grid>
                     <Posts arrStart={arr} currentStart={current} fetchingStart={fetching}/>
                  </Grid>
               </Grid>
            </Grid>
         )
      }
   }

   return (
      <>
         {ui()}
      </>
   )
}

export default Main