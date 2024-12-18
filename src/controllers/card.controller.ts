import { Request, Response, NextFunction } from 'express';
import { getAllCards, createCard, updateCardById, deleteCardById } from '../services/card.service';

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await getAllCards();
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
};

export const addCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newCard = await createCard(req.body);
    res.status(201).json({ success: true, data: newCard });
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedCard = await updateCardById(id, req.body);
    if (!updatedCard) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }
    res.status(200).json({ success: true, data: updatedCard });
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedCard = await deleteCardById(id);
    if (!deletedCard) {
      return res.status(404).json({ success: false, message: 'Card not found' });
    }
    res.status(200).json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    next(error);
  }
};
