export function apply(ctx) {
  // Minimal Host plugin example.
  // Replace this with real plugin behavior. Keep registrations inside ctx.effect/ctx.on
  // so they are cleaned up on unload/reload.
  ctx.effect(() => {
    ctx.logger('ainlee-example-hello').info('example hello plugin loaded');
    return () => {};
  });
}
