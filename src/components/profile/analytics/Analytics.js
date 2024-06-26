import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';

import { useSelector } from 'react-redux'

import styles from "./analytics.module.scss"

const Analytics = ({userLikes, viewsCount}) => {
   return(
      <Box className={styles.container}>
         <Typography variant='h6'>Analytics</Typography>
         <Box className={styles.flex}>
            <Box className={styles.content}>
               <PeopleIcon className={styles.icon}/>
               <Typography >
                  {viewsCount} profile view
               </Typography>
            </Box>
            <Box className={styles.content}>
               <BarChartIcon className={styles.icon}/>
               <Typography >
                  {userLikes} likes posts
               </Typography>
            </Box>
         </Box>
      </Box>
   )
}

export default Analytics