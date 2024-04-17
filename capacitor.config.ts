import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.botfi.app',
  appName: 'BotFi',
  webDir: 'dist',
  server: {
    cleartext: true,
  },
  android: {
    webContentsDebuggingEnabled: false,
    allowMixedContent: true
  },
  plugins: { 
    CapacitorCookies: {
      enabled: true
    },
    SplashScreen: {
      launchAutoHide: true, 
      launchShowDuration: 1,
      launchFadeOutDuration: 1
    },
    CapacitorUpdater: {
      updateUrl: 'https://app-updates.botfi.app/updates/updates.json',
      privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpQIBAAKCAQEAqh4zT/wZSpCyM5Tj252FTN/9BGQzDsGOHHwF24gKdeavvw3K\n/focqxbhsk9WuEs718GZA5iNpdT9Zzo3rY8QpF6ZV5WRkhob9oJgE7S2Kq9oqgpZ\nEuUIl4DpgXK/2zr2OBt+QmBvyQIqGGQs3qLInUrcicmZTLOTGFXMwiJXRnADzf6R\nqcozwVrl08YanLCu9jPeTx7+/xvdOpTszXV9AGEE0jwD93mYuZ5pzSLBxZdkJZeF\nbTwg4afueQrbo17ekvkHFGTsenslYmCNbr5NspeqRUo1M1E3kMKx0lAHh/q1ER7F\n69sDWB6riAt0Qs4bpWXRLotxFNAaY5cI83FfBwIDAQABAoIBAFNRi0wnarOsfrro\nt1i+o6TtJ1zZPnCBt/qXe77zuDvaikUGml8d+qCJCm1skkqc/mhDt4+dTfLkiF/g\nkZh9s2bttijBZpSqGPv5Ctlb7sSlOJvfiZTJfBXH25W8/9592E3OmV4lIVrPppJf\nreI01BDFs5IAnQaGBQssKqcCbsBeG8kk5/wg844yXFy5ep3/0mTaNLXuKArPzmPY\nhRkVRNzkfPXDBHrqectC+judNC44VmqFUm+EIu9SD9E94bg3q7/lRg1THtUQ/RQm\nd60d2N9/JS+LGkMZvBEzAA4daSa4jndMs6zgKNZjrnxbDceywV+QXsXIW1VsEUg1\nHASYEpECgYEA2T9zISn+XBHGyjllV9In5E0HYDgXOWNTDN8wz+MkVS8yrcEltvVJ\nil559lo4+Z/umjDMv0AuCu7daqDBWkh2MycCdtMQe9uuX8pi3HadGu1qqs6X0mBY\nvsnYpfJ92SqJWRuLHsV5+NOFEwp0A5MTdXVNWM6rVbfSkeRa8VwChmsCgYEAyHaU\nnkllNyDdQV3gZCxPtx2ERnOGL1tf+S3Ddh4HGENxvCGYw2oaEdn2vS+zFkO1CMfs\ncHrP89E4zuJ3Y5r9T4fWbB7+XcO6bUdw+Lyep3lcHLZrW2vQhVK3sc4irSz0IhsJ\nZYOppyt6DaKyloQ981M42S5KTP0xSf+K68KYmNUCgYEAroF0FmioBAbXeqs+B5wt\nJQrm6NhFd3icRpOlnuei0LY37DBg/iTr7LTVHRj9+S4JuFuIq/t+wJN80eDNT5sz\nLwWfyhjifctJt3JXlSXGLtIUw51tgLSZtK9oUmyFwIKVjzk7t/0Ca+hkVZYo+JIU\nqF4QQkzIffNJtp0KnCO/d38CgYEAqQDwAxK1tmiKoJVYnJuPCT5lSlATDNHoc9dV\nNrvSF26k8IsSk41cNTihgJY6Ucb7VU/X0mx37YKydhkPtnXwoaBP8g+fO8XL4l2c\nrNe4mlECi2Jv2D9pKT23iLvVGFMR778DiQYbfch1uhE0pxkOcZn0D4WrNoUvjMdY\ng7Mnm5ECgYEAjep3yCpR9aKZij2b7h9sksgqsr6F7+24hLfJkGRkPo1VK8K/kh9Y\n+KJR72DDaeiTXXImiJ+TAh8/EzPozj4qwnA2RaqfV4eJwyN/DKgzNlqheJkS+jpR\nOgy8NLbVMmwass/wskhvJmlTyObxAGdGy7BOtDMGDdJqGT7HEYVoHu0=\n-----END RSA PRIVATE KEY-----\n'
    }
  }
};

export default config;
