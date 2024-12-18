import { Router } from 'express';
import { getCards, addCard, updateCard, deleteCard } from '../controllers/card.controller';

const router = Router();

router.get('/', getCards);
router.post('/', addCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

export default router;
