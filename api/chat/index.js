import express from 'express';

import get from './get.js';
import post from './post.js';
import _delete from './delete.js';

const router = express.Router();

router.use('/', get);
router.use('/', post);
router.use('/', _delete);

export default router;
