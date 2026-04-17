export type Service =
  | 'Maintenance Detail'
  | 'Deep Reset Detail'
  | 'Digital Product';

export type Location =
  | 'Garage Studio'
  | 'On-Island Mobile'
  | 'N/A';

export type VehicleSize =
  | 'Sedan'
  | 'Small SUV'
  | 'Large SUV/Truck'
  | 'N/A';

export interface HelcimLinkConfig {
  service: Service;
  location: Location;
  vehicleSize: VehicleSize;
  label: string;
  amount: number;
  url: string;
}

export const HELCIM_LINKS: HelcimLinkConfig[] = [
  {
    service: 'Maintenance Detail',
    location: 'Garage Studio',
    vehicleSize: 'Sedan',
    label: 'Maintenance Detail – Sedan (Shop)',
    amount: 49.1,
    url: 'https://signalsource.myhelcim.com/hosted/?token=f7dde0ccfc7b6f5ba1e974&amount=49.10&amountHash=012e1e609fbc4f74624c2473be468661d47cb5bb9fd37f96b9aa8af48b173044',
  },
  {
    service: 'Maintenance Detail',
    location: 'Garage Studio',
    vehicleSize: 'Small SUV',
    label: 'Maintenance Detail – Small SUVs (Shop)',
    amount: 54.55,
    url: 'https://signalsource.myhelcim.com/hosted/?token=bdeb88944f0efb17b55bc9&amount=54.55&amountHash=cceb08ad20b0141043d16527885b857d22a59dd95d0f5cbe0cff4b598ab50964',
  },
  {
    service: 'Maintenance Detail',
    location: 'Garage Studio',
    vehicleSize: 'Large SUV/Truck',
    label: 'Maintenance Detail – Large SUVs/Trucks (Shop)',
    amount: 60.01,
    url: 'https://signalsource.myhelcim.com/hosted/?token=c8857834087a962e54d7ba&amount=60.01&amountHash=bd859e0fc7c215eee6b7b34831a2c13d462adfd68afcadf1c37bdbe69208e0c4',
  },
  {
    service: 'Maintenance Detail',
    location: 'On-Island Mobile',
    vehicleSize: 'Sedan',
    label: 'Maintenance Detail – Sedan (Mobile)',
    amount: 55.64,
    url: 'https://signalsource.myhelcim.com/hosted/?token=6c97b8865143eda12875c8&amount=55.64&amountHash=701838ad3147a720e440832389b3002c86d9ec1c362b50e76f7d16e35eb16940',
  },
  {
    service: 'Maintenance Detail',
    location: 'On-Island Mobile',
    vehicleSize: 'Small SUV',
    label: 'Maintenance Detail – Small SUVs (Mobile)',
    amount: 61.1,
    url: 'https://signalsource.myhelcim.com/hosted/?token=ca249a4d9fc0b9c8483af4&amount=61.10&amountHash=99fc59302eb68bba7a9933493150628ce05ce96d6b44397f1a7086962d162643',
  },
  {
    service: 'Maintenance Detail',
    location: 'On-Island Mobile',
    vehicleSize: 'Large SUV/Truck',
    label: 'Maintenance Detail – Large SUVs/Trucks (Mobile)',
    amount: 66.55,
    url: 'https://signalsource.myhelcim.com/hosted/?token=b82fe737247950cc618a07&amount=66.55&amountHash=b43c93c68ff8e78cbb153899083b534d45501619c4f835e25bdca7b61423d65a',
  },
  {
    service: 'Deep Reset Detail',
    location: 'Garage Studio',
    vehicleSize: 'Sedan',
    label: 'Deep Reset Detail – Sedan (Shop)',
    amount: 87.28,
    url: 'https://signalsource.myhelcim.com/hosted/?token=8428830ddf1125966bb78d&amount=87.28&amountHash=628c38acec23b3cd2734e48aa1270ce1c7433b651646b20635beddd437fea0ba',
  },
  {
    service: 'Deep Reset Detail',
    location: 'Garage Studio',
    vehicleSize: 'Small SUV',
    label: 'Deep Reset Detail – Small SUVs (Shop)',
    amount: 98.19,
    url: 'https://signalsource.myhelcim.com/hosted/?token=ea6511548d7b0f1c0360bd&amount=98.19&amountHash=3beba91de2c6a33989212c08db64a6d0e177691122db579a0713bd30b4769b77',
  },
  {
    service: 'Deep Reset Detail',
    location: 'Garage Studio',
    vehicleSize: 'Large SUV/Truck',
    label: 'Deep Reset Detail – Large SUVs/Trucks (Shop)',
    amount: 109.1,
    url: 'https://signalsource.myhelcim.com/hosted/?token=6b96a48aca51224788b21e&amount=109.10&amountHash=96f434e97d5a08e72ceb14199d6e71f6ea1ea02a0425a966e33c0f35c2e4c50d',
  },
  {
    service: 'Deep Reset Detail',
    location: 'On-Island Mobile',
    vehicleSize: 'Sedan',
    label: 'Deep Reset Detail – Sedan (Mobile)',
    amount: 93.83,
    url: 'https://signalsource.myhelcim.com/hosted/?token=5656549adc4d4472c21854&amount=93.83&amountHash=67c9b0c114d27db5ba93c6aa550707a2d6ed7a8da2e63791a4c0100baa086533',
  },
  {
    service: 'Deep Reset Detail',
    location: 'On-Island Mobile',
    vehicleSize: 'Small SUV',
    label: 'Deep Reset Detail – Small SUVs (Mobile)',
    amount: 104.74,
    url: 'https://signalsource.myhelcim.com/hosted/?token=8dbb5a3817418593b50cfd&amount=104.74&amountHash=6134404be90f3cbe5ad5d26ae8f55fbe944c88a6984029f7fbf4e75c54a3b6a6',
  },
  {
    service: 'Deep Reset Detail',
    location: 'On-Island Mobile',
    vehicleSize: 'Large SUV/Truck',
    label: 'Deep Reset Detail – Large SUVs/Trucks (Mobile)',
    amount: 115.65,
    url: 'https://signalsource.myhelcim.com/hosted/?token=83435778df7e7bb6205a29&amount=115.65&amountHash=63e18a7be835484484a71d012a2099004bc3b9c0ec08edf2be103d15cd4e985c',
  },
  {
    service: 'Digital Product',
    location: 'N/A',
    vehicleSize: 'N/A',
    label: 'Digital Life & Income Pack 2026',
    amount: 147,
    url: 'https://signalsource.myhelcim.com/hosted/?token=1949190ee7aaaf35dba111&amount=147.00&amountHash=c1a44255ca09f468e2124cfd881fde58ca872c828fc80bfe4111a69f31a2240b',
  },
  {
    service: 'Digital Product',
    location: 'N/A',
    vehicleSize: 'N/A',
    label: 'Debt & Bills Dashboard 2026 – A Zero-BS Plan to Stop Drowning',
    amount: 47,
    url: 'https://signalsource.myhelcim.com/hosted/?token=b84d5d12b978c9041ef043&amount=47.00&amountHash=024fe5db6e311ed06a901429321e92f56a3320df46421307d2f5d867495bf284',
  },
  {
    service: 'Digital Product',
    location: 'N/A',
    vehicleSize: 'N/A',
    label: '2026 Overwhelm Reset – 7-Day System to Get Your Life Back Under Control',
    amount: 39,
    url: 'https://signalsource.myhelcim.com/hosted/?token=a064dcb3e63be5d02cf39e&amount=39.00&amountHash=b664cc3403154734bcf92bd34b09ddb6ac5281ca482d1b0efe5e2de445d65f0f',
  },
];

export function getHelcimLink(params: {
  service: Service;
  location: Location;
  vehicleSize: VehicleSize;
}): HelcimLinkConfig {
  const matches = HELCIM_LINKS.filter(
    (link) =>
      link.service === params.service &&
      link.location === params.location &&
      link.vehicleSize === params.vehicleSize
  );

  if (matches.length !== 1) {
    console.error('Invalid Helcim link lookup', params, matches);
    throw new Error('We could not route your deposit payment. Please contact SignalSource directly.');
  }

  return matches[0];
}

export function getDigitalProductLink(label: string): HelcimLinkConfig {
  const matches = HELCIM_LINKS.filter(
    (link) => link.service === 'Digital Product' && link.label === label
  );

  if (matches.length !== 1) {
    console.error('Invalid Helcim digital product lookup', label, matches);
    throw new Error('We could not open the payment page for this guide right now.');
  }

  return matches[0];
}
