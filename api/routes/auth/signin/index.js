import express from 'express';

import pool, { queryAll } from '../../../model/db.js';
import createQuery from '../../../model/query.js';

import errorGenerator from '../../../utils/errorGenerator.js';
import { createToken } from '../../../utils/jwt.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      throw errorGenerator({
        message: 'no body',
        code: 'req/no-req-body'
      });
    }

    const connection = await pool.getConnection(async conn => conn);

    const GET_USER_QUERY = createQuery('auth/GET_USER_UID', { id });
    const userSnapshot = await queryAll(connection, GET_USER_QUERY);

    connection.release();

    if (userSnapshot.isEmpty) {
      connection.release();
      throw errorGenerator({
        message: 'user not exists',
        code: 'auth/user-not-found'
      });
    }

    const uid = userSnapshot.data[0].uid;

    const accessToken = createToken({ uid });

    res.status(200).json({ accessToken, id });
  } catch (err) {
    console.log(err);
    switch (err.code) {
      case 'req/missing-body':
        res.status(400).json({
          message: '아이디를 입력해주세요'
        });
        break;
      case 'auth/user-not-found':
        res.status(404).json({
          message: '계정을 찾을 수 없습니다'
        });
        break;
      default:
        res.status(500).json({
          message: '다시 시도해주세요'
        });
    }
  }
});

export default router;
