/**
 * Wrap async route handler để tự forward error vào error middleware.
 * Khỏi phải viết try/catch lặp đi lặp lại trong từng controller.
 *
 * Usage: router.get('/x', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
