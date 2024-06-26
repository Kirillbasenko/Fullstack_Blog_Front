import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';

import { useState, useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import SaveAsIcon from '@mui/icons-material/SaveAs';

import styles from "./editAvatarModal.module.scss"

//import Avatar from 'react-avatar-edit';

const EditAvatarModal = ({open, handleClose, src, avatar, changeQuality, changeSrc}) => {
   const [srcEdit, setSrcEdit] = useState(src)
   const [preview, setPreview] = useState(null)
   const [AvatarEdit, setAvatarEdit] = useState(null);

   const {width} = useSelector(state => state.width)

   //console.log(srcEdit);

   const loadAvatarComponent = async () => {
      const { default: Avatar } = await import('react-avatar-edit');
      setAvatarEdit(() => Avatar);
   };

   useEffect(() => {
      loadAvatarComponent()
   }, [open])

   useEffect(() => {
      setSrcEdit(src)
   }, [src])

   const onClose = () => {
      setPreview(null)
   }

   const onCrop = (view) => {
      setPreview(view);
      //changeQuality(preview)
      changeQuality(view)
      //console.log(view);
   }

   function base64toFile(base64Data, fileName) {
      const [contentType, content] = base64Data.split(';base64,');
      
      const byteCharacters = atob(content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
         byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const blob = new Blob([new Uint8Array(byteNumbers)], { type: contentType });

      return new File([blob], fileName, { type: contentType });
   }

   console.log(preview);


   if(preview){
      let randomNum = Math.random() * 1000000
      const file = base64toFile(preview, `${randomNum.toFixed(0)}example.jpg`);
   }

   return(
      <Modal
         open={open}
         onClose={handleClose}
         aria-labelledby="modal-modal-title"
         aria-describedby="modal-modal-description">
         <Box sx={{width: width > 768 ? 500 : "90%"}} className={styles.modal}>
            <Box className={styles.flex}>
               <Typography id="modal-modal-title" variant="h6" component="h2">
                  Edit photo
               </Typography>
               <IconButton onClick={() => handleClose()} color="primary" aria-label="upload picture" component="label">
                  <CloseIcon />
               </IconButton>
            </Box>
            <Box className={styles.avatar}>
               {AvatarEdit && <AvatarEdit
                  width={300}
                  height={400}
                  onClose={onClose}
                  onCrop={onCrop}
                  src={srcEdit}/>}
            </Box>
            <Box className={styles.buttonCenter}>
            </Box>
            <Box className={styles.buttonCenter}>
               <Button onClick={() => {
                  /*if(preview){
                     let randomNum = Math.random() * 1000000
                     const file = base64toFile(preview, `${randomNum.toFixed(0)}example.jpg`);
                     //changeSrc(file)
                     //console.log(preview);
                     changeSrc(preview)
                  }*/
                  //console.log(preview);
                  changeSrc(preview)
                  //changeQuality(preview)
                  handleClose()
               }}  className={styles.buttonSubmit}  color='success' variant="contained"  endIcon={<SaveAsIcon />}>
                  save
               </Button>
            </Box>
         </Box>
      </Modal>
   )
}

export default EditAvatarModal