// #region Package imports
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// #endregion

// #region local imports
import HandleError from './middlewares/ErrorHandle.js';
import RegisterRouter from './routes/auth/Register.js';
import RegisterMiddleware from './middlewares/RegisterHandle.js';
import handleStatus from './languages/HandleStatus.js';
import Config from './configs/configure.js';
import LoginRouter from './routes/auth/Login.js';
import AddAdminRouter from './routes/admin/AddAdmin.js';
import AuthMiddleware from './middlewares/AuthHandle.js';
import AddAdminMiddleware from './middlewares/AddAdminHandle.js';
import Logout from './routes/auth/Logout.js';
import SuspendBan from './routes/admin/SuspendBan.js';
import ListusersRouter from './routes/admin/listusers.js';
import UploadPfpHandle from './middlewares/UploadpfpHandle.js';
import UploadCarHandle from './middlewares/UploadCarHandle.js';
import { uploadPfp } from './utilities/Upload.js';
import { CreateAuctionMiddleware, CreateCarHandleMiddleware } from './middlewares/CarHandle.js';
import CreateAuctionRouter from './routes/user/CreateAuction.js';

// #endregion
const app = express();
const PORT = Config().port;
// #region Middlewares
app.use(cors());
app.use(express.json());

app.use(cookieParser(Config().cookieSecret));

const SuperAdminMiddleware = AuthMiddleware().SuperAdminPermissionMiddleware;
const AdminMiddleware = AuthMiddleware().AdminPermissionMiddleware;
const IsVerifiedMiddleware = AuthMiddleware().IsVerifiedMiddleware;
// #endregion
// #region Routes

app.use('/register', [ RegisterMiddleware, UploadPfpHandle, uploadPfp ], RegisterRouter);

app.use('/login', LoginRouter);

app.use('/logout', Logout);

app.use('/addadmin', [ AuthMiddleware, SuperAdminMiddleware, AddAdminMiddleware ] , AddAdminRouter);

app.use('/suspendban', [ AuthMiddleware, AdminMiddleware ], SuspendBan);

app.use('/listusers', [ AuthMiddleware, AdminMiddleware ], ListusersRouter);

app.use('/createauction', [ AuthMiddleware, IsVerifiedMiddleware, CreateCarHandleMiddleware, CreateAuctionMiddleware, UploadCarHandle ], CreateAuctionRouter);



// #endregion

// #region Error Handling

app.use((req, res, next) => {
  let lang = req.headers['accept-language'] || 'EN';
  if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
    lang = 'EN';
  }
  res.status(404).json({ error: handleStatus('404', lang) });
});
app.use(HandleError);
// #endregion
// #region Server Initialization
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// #endregion