import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box, CardActionArea } from '@mui/material';
import Button from '@mui/material/Button';

import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CircularProgress from '@mui/material/CircularProgress';

import { remuveComment, updateComment } from '@/http/commentApi';

import { setUserLikes } from '@/store/slices/postSlice';

import { fetchComments } from "@/http/commentApi"
import { updateLike } from '@/http/postApi';
import PlaygroundSpeedDial from '../../other/PlaygroundSpeedDial';
import { checkPost } from '@/http/postApi';
import CommentField from './comment/commentField/CommentField';
import CommentsList from './comment/CommentsList';
import LikeModal from '@/components/modal/likeModal/LikeModal';

import { fetchPosts } from '@/http/postApi';

import { useDispatch, useSelector } from 'react-redux';
import { formatDistance, subDays } from 'date-fns'
import { useEffect, useState } from 'react';

import styles from "../../../styles/main/post.module.scss"

const Post = ({post, deletePost}) => {
   const dispatch = useDispatch()
   const [like, setLike] = useState(post.likes || 0)
   const [userLike, setUserLike] = useState(post.likesUsers)
   const [openComment, setOpenComment] = useState(false)
   const [commentsLength, setCommentsLength] = useState(null)
   const [fetching, setFetching] = useState(true)
   const [userComments, setUserComments] = useState([])
   const [openLikeModal, setLikeModal] = useState(false)
   const [comments, setComments] = useState([])
   const [focus, setFocus] = useState(false)
   const [current, setCurrent] = useState(0)
   const {user} = useSelector(state => state.user)

   const checkUserLike = userLike.filter(item => item._id === user._id)
   const checkUserComment = comments.filter(item => item.user._id === user._id)

   const editComment = async (id, comment, img) => {
      let newComments
      await updateComment(id, comment, img).then(data => {
         newComments = comments.map(item => {
            if (item._id === id) {
               return data;
            } else {
               return item;
            }
         })
      })
      setComments(newComments)
      fetchComments(post._id, commentsLength, 1).then(data => {
         setComments(data.comments)
         setCommentsLength(data.commentsLength.length)
      })
   }

   useEffect(() => {
      if(openComment){
         fetchComments(post._id, 3, 1).then(data => {
            setComments(data.comments)
            setCommentsLength(data.commentsLength.length)
         })
      }
   }, [commentsLength])

   const deleteComment = (id) => {
      remuveComment(id)
      let newCommentsList = comments.filter(item => item._id !== id)
      setComments(newCommentsList)
      fetchComments(post._id, 3, 1).then(data => {
         setCommentsLength(data.commentsLength.length)
      })
   }

   const words = post.title.split(/(\s+)/);

   const highlightedWords = words.map((word, index) => {
      const hashtagRegex = /#[a-zA-Z0-9]+/g;
      if (word.match(hashtagRegex)) {
         return <span key={index} style={{ color: "#366CC5" }}>{word}</span>;
      } else {
         return word;
      }
   });
   //console.log(fetching);
   //console.log(current);

   useEffect(() => {
      if(fetching){
         fetchComments(post._id, 3, current || 1).then(data => {
               setComments([...comments, ...data.comments])
               setCommentsLength(data.commentsLength.length)
            })
         .finally(() => {
               setFetching(false)
               setCurrent(current => current + 1)
            })}
   }, [fetching])

   const addComment = (com) => {
      setComments(comments => [com, ...comments])
      setCommentsLength(commentsLength => commentsLength + 1)
      setCurrent(2)
      
   }

   const submitLike = () => {
      const checkUserLike = userLike.filter(item => item._id === user._id)
      const likes = checkUserLike.length === 0 ? like + 1 : like - 1 
      let newLikesUsers = checkUserLike.length !== 0 ? post.likesUsers.filter(item => item._id !== user._id) : [...userLike, user]
      updateLike(post._id, likes, newLikesUsers, user._id).then(data => {
         setUserLike(data.doc.likesUsers)
         setLike(data.doc.likes)
         const likesTotal = data.posts.reduce((total, post) => {
            if(post.user._id === user._id){
               return total + post.likes; 
            }
         }, 0);
         dispatch(setUserLikes(likesTotal));
      })
   }

   useEffect(() => {
      checkPost(post._id).then(data => {
         setUserComments(data.likesUsers)
         //console.log(data.likesUsers);
      } )
      //console.log(1);
   }, [userLike])

   return(
      <Card className={styles.parent}>
         <CardMedia
            sx={{objectFit: "contain", borderRadius: "50%", width: 40, height: 40, display: "inline"}}
            component="img"
            image={post.user.avatarImage ? `http://localhost:5000${post.user.avatarImage}` : "/avatarUser.jpg"}
            alt="green iguana"/>
         <Box className={styles.content}>
            <Box className={styles.flex}>
               <Typography>{post.user.name}</Typography>
               {post.user._id === user._id ? 
                  <PlaygroundSpeedDial 
                     id={post._id} 
                     type={post.type} 
                     image={post.img} 
                     title={post.title} 
                     deletePost={deletePost}/>: null}
            </Box>
            <Typography className={styles.date}>{formatDistance(subDays(new Date(post.createdAt), 0), new Date(), { addSuffix: true })}</Typography>
            <Typography className={styles.text}><p>{highlightedWords}</p></Typography>
            {post.img ? 
            <CardMedia
               className={styles.image}
               component="img"
               image={`http://localhost:5000${post.img}`}
               alt="green iguana"/> : null}
            <Box className={styles.flex}>
               {like !== 0 ?<Button onClick={() => setLikeModal(true)} className={styles.flexLike}>
                  <FavoriteIcon className={styles.likeIcon}/>
                  <Typography className={styles.comments}>{like}</Typography>
               </Button> : null}
               {commentsLength ?<Button onClick={() => setOpenComment(true)}  className={styles.comments}>{commentsLength} Comments</Button> : null}
            </Box>
            <Box>
               <Button onClick={submitLike} className={styles.button} variant="outlined" sx={{paddingX: 3}} startIcon={<FavoriteIcon sx={{width: 20, height: 20, color: checkUserLike.length === 0 ? "#ECEAEA" : "red"}}/>}>
                  <Typography variant='body3' sx={{color: checkUserLike.length === 0 ? "#ECEAEA" : "red"}}>Like</Typography>
               </Button>
               <Button className={styles.button} onClick={() => {
                  setOpenComment(!openComment)
                  setFocus(!focus)
               }} variant="outlined" sx={{paddingX: 3}} startIcon={<ChatBubbleIcon sx={{width: 20, height: 20, color: checkUserComment.length === 0 ? "#ECEAEA" : "#4E6DE0"}}/>}>
                  <Typography variant='body3' sx={{color: checkUserComment.length === 0 ? "#ECEAEA" : "#4E6DE0"}}>Comment</Typography>
               </Button>
            </Box>
            {openComment ?
            <Box className={styles.comment}>
               <CommentField setArr={addComment} focus={focus} id={post._id} userPhoto={user.avatarImage}/>
               <CommentsList editComment={editComment} deleteCommentFirst={deleteComment} comments={comments} id={post._id} userPhoto={user.avatarImage}/>
               {comments.length < commentsLength && !fetching ?
               <Button variant="text" className={styles.buttonAdd} onClick={() => setFetching(true)}>Load more comments</Button> : null}
               {fetching ? <Box className={styles.spinner}><CircularProgress  /></Box>  : null}
            </Box> : null}
            
         </Box>
         <LikeModal likeList={userComments} open={openLikeModal} handleClose={() => setLikeModal(false)}/>
      </Card>
   )
}

export default Post