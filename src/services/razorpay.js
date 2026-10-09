const CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_URL}"]`);
    const script = existing || document.createElement('script');
    const onLoad = () =>
      window.Razorpay
        ? resolve(window.Razorpay)
        : reject(new Error('Razorpay checkout did not load.'));
    const onError = () => {
      script.remove();
      reject(
        new Error(
          'Could not load Razorpay checkout. Check your internet connection and try again.',
        ),
      );
    };

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (!existing) {
      script.src = CHECKOUT_URL;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}
