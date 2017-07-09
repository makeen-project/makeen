import toNumber from 'lodash/toNumber';
import isPlainObject from 'lodash/isPlainObject';
import toUpper from 'lodash/toUpper';
import snakeCase from 'lodash/snakeCase';

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

export const parseENV = val => {
  if (['true', 'false'].includes(val)) {
    return {
      true: true,
      false: false,
    }[val];
  }

  if (!isNaN(val)) {
    return toNumber(val);
  }

  return val;
};

export const loadFromENV = (prefix, data) => {
  if (isPlainObject(data)) {
    return Object.keys(data).reduce(
      (acc, propr) => ({
        ...acc,
        [propr]: loadFromENV(
          `${prefix}_${toUpper(snakeCase(propr))}`,
          data[propr],
        ),
      }),
      {},
    );
  }

  if (Array.isArray(data)) {
    return data.map((item, index) => loadFromENV(`${prefix}_${index}`, item));
  }

  return parseENV(process.env[prefix]);
};
