import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
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

import styles from "./post.module.scss"

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
      } )
   }, [userLike])

   return (
      <Card
         sx={{
            display: "flex",
            borderRadius: "15px",
            color: "aliceblue",
            backgroundColor: "rgba(20, 32, 75, 0.6784313725)",
            padding: "10px",
            paddingBottom: "14px",
            marginBottom: "15px",
         }}
      >
         <CardMedia
            sx={{
               objectFit: "contain",
               borderRadius: "50%",
               width: 50,
               height: 50,
               display: "inline",
               cursor: "pointer"
            }}
            component="img"
            image={
            post.user.avatarImage
               ? post.user.avatarImage
               : "/avatarUser.jpg"
            }
            alt="green iguana"
         />
         <Box
            sx={{ flex: "1 1 auto", marginLeft: "10px", flexDirection: "column" }}
            className={styles.content}
         >
            <Box
            sx={{
               display: "flex",
               justifyContent: "space-between",
               alignItems: "center",
            }}
            className={styles.flex}
            >
            <Typography
               className={styles.name}
               sx={{
                  fontSize: "18px",
                  cursor: "pointer"
                  }}>{post.user.name}</Typography>
            {post.user._id === user._id ? (
               <PlaygroundSpeedDial
                  id={post._id}
                  type={post.type}
                  image={post.img}
                  title={post.title}
                  deletePost={deletePost}
                  video={post.video}
               />
            ) : null}
            </Box>
            <Typography
            sx={{
               fontSize: "13px",
               color: "rgba($color: #ffffff, $alpha: 0.3)",
               marginBottom: "10px",
            }}
            className={styles.date}
            >
            {formatDistance(subDays(new Date(post.createdAt), 0), new Date(), {
               addSuffix: true,
            })}
            </Typography>
            <Typography
            sx={{
               marginBottom: "12px",
               wordWrap: "break-word",
               maxWidth: "400px",
            }}
            className={styles.text}
            >
            <p>{highlightedWords}</p>
            </Typography>
            {post.img ? (
            <CardMedia
               sx={{
                  objectFit: "fill",
                  display: "inline",
                  marginBottom: "10px",
                  borderRadius: "7px",
                  maxHeight: "550px",
               }}
               className={styles.image}
               component="img"
               image={post.img}
               alt="green iguana"
            />
            ) : null}
            {post.video ? (
            <Box className={styles.videoContainer}>
               <video muted={true} height={300} width={"250px"} className={styles.video} src={`${process.env.API_URL}${post.video}`} controls>
               </video>
            </Box>
            ) : null}
            <Box
               sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "5px"
               }}
               className={styles.flex}
            >
            {like !== 0 ? (
               <Button
                  onClick={() => setLikeModal(true)}
                  className={styles.flexLike}
                  sx={{
                     display: "flex",
                     fontSize: "12px",
                     alignItems: "center",
                     color: "rgba($color: #ffffff, $alpha: 0.4)"
                  }}
               >
                  <FavoriteIcon 
                     className={styles.likeIcon}
                     sx={{
                        color: "#ffffff",
                        backgroundColor: "red",
                        borderRadius: "50%",
                        textAlign: "center",
                        width: "20px",
                        height: "20px",
                        padding: "2px 0px",
                        alignItems: "center",
                        marginRight: "5px"
                     }}
                     />
                  <Typography 
                     sx={{
                        fontSize: "12px",
                        color: "rgba($color: #ffffff, $alpha: 0.4)",
                        textTransform: "capitalize"
                     }}
                     className={styles.comments}>{like}</Typography>
               </Button>
            ) : null}
            {commentsLength ? (
               <Button
                  onClick={() => setOpenComment(true)}
                  sx={{
                     fontSize: "12px",
                     color: "rgba($color: #ffffff, $alpha: 0.4)",
                     textTransform: "capitalize"
                  }}
                  className={styles.comments}
               >
                  <Typography 
                     sx={{
                        fontSize: "12px",
                        color: "rgba($color: #ffffff, $alpha: 0.4)",
                        textTransform: "capitalize"
                     }}
                     className={styles.comments}>{commentsLength} Comments</Typography>
               </Button>
            ) : null}
            </Box>
            <Box 
               sx={{borderTop: "1px solid #414243",
                  paddingTop: "3px",}}>
            <Button
               onClick={submitLike}
               className={styles.button}
               variant="outlined"
               sx={{ 
                  paddingX: 3,
                  border: 0,
                  marginRight: "5px",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "14px",
                  color: "rgb(236, 234, 234)",
                  marginTop: "10px",
                  minWidth: "135px",
                  height: "30px"
                  }}
               startIcon={
                  <FavoriteIcon
                  sx={{
                     width: 20,
                     height: 20,
                     color: checkUserLike.length === 0 ? "#ECEAEA" : "red",
                  }}
                  />
               }
            >
               <Typography
                  variant="body3"
                  sx={{ 
                     color: checkUserLike.length === 0 ? "#ECEAEA" : "red",
                     fontSize: "16px"
                  }}
               >
                  Like
               </Typography>
            </Button>
            <Button
               className={styles.button}
               sx={{ 
                  paddingX: 3,
                  border: 0,
                  marginRight: "5px",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "14px",
                  color: "rgb(236, 234, 234)",
                  marginTop: "10px",
                  minWidth: "135px",
                  height: "30px"
                  }}
               onClick={() => {
                  setOpenComment(!openComment);
                  setFocus(!focus);
               }}
               variant="outlined"
               startIcon={
                  <ChatBubbleIcon
                  sx={{
                     width: 20,
                     height: 20,
                     color: checkUserComment.length === 0 ? "#ECEAEA" : "#4E6DE0",
                  }}
                  />
               }
            >
               <Typography
                  variant="body3"
                  sx={{
                     color: checkUserComment.length === 0 ? "#ECEAEA" : "#4E6DE0",
                     fontSize: "16px"
                  }}
               >
                  Comment
               </Typography>
            </Button>
            </Box>
            {openComment ? (
            <Box 
               sx={{
                  marginLeft: "-55px",
               }}
               className={styles.comment}>
               <CommentField
                  setArr={addComment}
                  focus={focus}
                  id={post._id}
                  userPhoto={user.avatarImage}
               />
               <CommentsList
                  editComment={editComment}
                  deleteCommentFirst={deleteComment}
                  comments={comments}
                  id={post._id}
                  userPhoto={user.avatarImage}
               />
               {comments.length < commentsLength && !fetching ? (
                  <Button
                  variant="text"
                  sx={{
                     display: "flex",
                     textTransform: "capitalize",
                     margin: "0 auto"
                  }}
                  className={styles.buttonAdd}
                  onClick={() => setFetching(true)}
                  >
                  Load more comments
                  </Button>
               ) : null}
               {fetching ? (
                  <Box 
                     className={styles.spinner}
                     sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                        }}>
                  <CircularProgress />
                  </Box>
               ) : null}
            </Box>
            ) : null}
         </Box>
         <LikeModal
            likeList={userComments}
            open={openLikeModal}
            handleClose={() => setLikeModal(false)}
         />
      </Card>
   );
}

export default Post