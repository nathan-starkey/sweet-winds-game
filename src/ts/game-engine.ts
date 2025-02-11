const TIME_STEP = 1 / 60;

export let fps = 0;

export const init = (update: (timeStep: number) => void, draw: (dt: number) => void) => {
  let timeThen = performance.now() / 1000 - TIME_STEP;
  let lag = TIME_STEP;

  let metricTime = 0;
  let metricCount = 0;

  const loop = () => {
    let timeNow = performance.now() / 1000;
    let deltaTime = timeNow - timeThen;

    lag = Math.min(lag, TIME_STEP * 6);
    lag += deltaTime;

    while (lag >= TIME_STEP) {
      update(TIME_STEP);
      lag -= TIME_STEP;
    }

    draw(deltaTime);

    timeThen = timeNow;

    metricTime += deltaTime;
    metricCount++;

    requestAnimationFrame(loop);
  };

  loop();

  setInterval(() => {
    fps = metricCount / metricTime || 0;

    metricTime = 0;
    metricCount = 0;
  }, 1000);
};