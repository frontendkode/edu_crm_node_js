import Session from '../models/Session';

export const findSessionByUserId = async (userId: string): Promise<Session | null> => {
  return Session.findOne({ where: { user_id: userId } });
};

export const createSession = async (
  sessionData: Partial<Session>
): Promise<Session> => {
  return Session.create(sessionData as any);
};

export const updateSessionByUserId = async (
  userId: string,
  updates: Partial<Session>
): Promise<[number, Session[]]> => {
  return Session.update(updates, {
    where: { user_id: userId },
    returning: true,
  });
};

export const deleteSessionByUserId = async (userId: string): Promise<number> => {
  return Session.destroy({ where: { user_id: userId } });
};
