import express from 'express'
import {Router} from 'express'
import { sendQandA ,addQandA} from '../controllers/devquest.controllers.js';

const devquestRoutes = Router();

devquestRoutes.get("/",sendQandA)
devquestRoutes.post("/",addQandA);

export default devquestRoutes;