import Card, { ICard } from '../models/card.model';

export const getAllCards = async (): Promise<ICard[]> => {
  return await Card.find();
};

export const createCard = async (cardData: Partial<ICard>): Promise<ICard> => {
  return await Card.create(cardData);
};

export const updateCardById = async (id: string, cardData: Partial<ICard>): Promise<ICard | null> => {
  return await Card.findByIdAndUpdate(id, cardData, { new: true });
};

export const deleteCardById = async (id: string): Promise<ICard | null> => {
  return await Card.findByIdAndDelete(id);
};
