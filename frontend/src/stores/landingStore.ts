import { makeAutoObservable } from 'mobx';

class LandingStore {
  isLoggedIn = !!localStorage.getItem('token');

  constructor() {
    makeAutoObservable(this);
  }

  setLoggedIn(v: boolean) {
    this.isLoggedIn = v;
  }

  syncAuthFromStorage() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }
}

export const landingStore = new LandingStore();
