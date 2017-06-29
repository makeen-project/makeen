import { ObjectID as objectId } from 'mongodb';
import EJSON from 'mongodb-extended-json';

export const toBSON = query =>
  EJSON.parse(typeof query !== 'string' ? JSON.stringify(query) : query);

export const idToQuery = id => ({ _id: objectId(id) });

export const createMiddleware = ({ id, factory, params }) => {
  const middleware = opts => {
    let finalOptions = params;
    if (typeof opts !== 'undefined') {
      if (typeof opts === 'object') {
        finalOptions = Object.assign({}, params || {}, opts);
      } else {
        finalOptions = opts;
      }
    }
    return factory(finalOptions);
  };

  Object.assign(middleware, {
    id,
    factory,
    params,
  });

  return middleware;
};

export const fromMongo = item => ({
  ...item,
  id: item._id.toString(),
});

export const toMongo = item => ({
  ...item,
  _id: objectId(item.id),
});

export const mapSeries = tasks =>
  tasks.reduce((promise, task) => promise.then(task), Promise.resolve());

export const resolveTasksGraph = (tasks, run, series = true) => {
  const walkTasks = tasks.map(task => {
    if (Array.isArray(task)) {
      return () => resolveTasksGraph(task, run, !series);
    }
    return () => run(task);
  });

  return series
    ? mapSeries(walkTasks)
    : Promise.all(walkTasks.map(item => item()));
};
