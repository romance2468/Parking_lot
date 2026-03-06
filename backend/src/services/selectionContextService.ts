/**
 * Микросервис контекста для страницы выбора парковки.
 * Возвращает пользователя и автомобиль — данные, необходимые для подстановки типа авто и бронирования.
 */
import { getProfileData } from './profileService';

export { getProfileData as getSelectionContext };
