import axios, {AxiosInstance} from "axios";
import Board from "./Board";
import BoardRender from "./BoardRender";
import Pipeline from "./Pipeline";
import WorkerRun from "./WorkerRun";
import {awaitTimeout} from "../utils/awaitTimeout";


const retriedPromise = (promise: Promise<any>, retryCount: number, retryTimeout: number): Promise<any> => {
  return promise.catch(async (error) => {
    if (retryCount === 0) {
      throw error;
    }
    console.error(error)
    console.log(`Retrying in ${retryTimeout}ms...`);
    await awaitTimeout(retryTimeout);
    return retriedPromise(promise, retryCount - 1, retryTimeout);
  });
}

export default class ApiClient {
  private TokenLocalStorageKey = "accessToken";
  private readonly endpoint: string;
  private axios: AxiosInstance;
  private isAuth: boolean;

  constructor() {
    if (process.env.REACT_APP_ENDPOINT) {
      this.endpoint = process.env.REACT_APP_ENDPOINT;
    } else {
      this.endpoint = "";
    }
    this.axios = axios.create();
    this.isAuth = false;
    const token = localStorage.getItem(this.TokenLocalStorageKey);
    if (token) {
      this.setAuth(token);
    }
  }

  public async auth(username: string, password: string): Promise<boolean> {
    return this.axios.post(`${this.endpoint}/auth`, {
      username, password,
    }).then((response) => {
      const token = response.data.access_token;
      if (!token) {
        throw new Error(`No access_token in ${response.data}`);
      }
      this.setAuth(token);
      return true
    });
  }

  public setAuth(token: string) {
    localStorage.setItem(this.TokenLocalStorageKey, token);
    this.isAuth = true;
    this.axios = axios.create({
      headers: {
        Authorization: "Bearer " + token,
      },
    });
  }

  public unsetAuth() {
    localStorage.removeItem(this.TokenLocalStorageKey);
    this.isAuth = true;
    this.axios = axios.create();
  }

  public hasAuth(): boolean {
    return this.isAuth;
  }

  public async getVersion(): Promise<string> {
    return this.axios.get(`${this.endpoint}/version`).then(response => response.data)
  }

  public async getBoards(): Promise<Board[]> {
    return this.axios.get(`${this.endpoint}/apiInternal/boards`).then((response) => response.data);
  }

  public async renderBoard(boardId: string): Promise<BoardRender> {
    return this.axios.get(`${this.endpoint}/apiInternal/boards/render/${boardId}`).then((response) => response.data);
  }

  public async callbackBoard(boardId: string, callbackId: string, rawDocument: object): Promise<BoardRender> {
    return retriedPromise(
      this.axios.post(`${this.endpoint}/apiInternal/boards/callback/${boardId}/${callbackId}`, rawDocument),
      3, 1000
    );
  }

  public async getWorkers() {
    return this.axios.get(`${this.endpoint}/apiInternal/worker`).then(response => response.data)
  }

  public async getWorkerModules(): Promise<object[]> {
    return this.axios.get(`${this.endpoint}/apiInternal/worker/modules`).then(response => response.data)
  }

  public async addWorker(moduleName: string, args: object, intervalSeconds: number) {
    return this.axios.post(`${this.endpoint}/apiInternal/worker`, {
      module_name: moduleName, args, interval_seconds: intervalSeconds,
    });
  }

  public async removeWorker(workerId) {
    return this.axios.delete(`${this.endpoint}/apiInternal/worker/${workerId}`);
  }

  public async updateWorkerIntervalSeconds(workerId, intervalSeconds) {
    return this.axios.put(`${this.endpoint}/apiInternal/worker/${workerId}/intervalSeconds/${intervalSeconds}`);
  }

  public async updateWorkerErrorResiliency(workerId: string, errorResiliency: number) {
    return this.axios.put(`${this.endpoint}/apiInternal/worker/${workerId}/errorResiliency/${errorResiliency}`);
  }

  public async getWorkerMetadata(workerId): Promise<object> {
    return this.axios.get(`${this.endpoint}/apiInternal/worker/${workerId}/metadata`).then(response => response.data)
  }

  public async setWorkerMetadata(workerId, metadata) {
    return this.axios.post(`${this.endpoint}/apiInternal/worker/${workerId}/metadata`, metadata);
  }

  public async getWorkerArgs(workerId: string): Promise<object> {
    return this.axios
      .get(`${this.endpoint}/apiInternal/worker/${workerId}/args`)
      .then(response => response.data)
  }

  public async getPipeline(): Promise<Pipeline | undefined> {
    return this.axios.get(`${this.endpoint}/apiInternal/pipeline`).then(response => response.data)
  }

  public async getWorkerRuns(page: number): Promise<WorkerRun[]> {
    return this.axios.get(
      `${this.endpoint}/apiInternal/worker/runs`,
      { params: { page } },
    ).then(response => response.data)
  }
}
