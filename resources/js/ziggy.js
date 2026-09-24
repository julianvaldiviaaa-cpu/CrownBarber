const Ziggy = {
    url: 'http:\/\/localhost:8000',
    port: 8000,
    defaults: {},
    routes: {
        'boost.browser-logs': {
            uri: '_boost\/browser-logs',
            methods: ['POST'],
        },
        home: { uri: '\/', methods: ['GET', 'HEAD'] },
        login: { uri: 'login', methods: ['GET', 'HEAD'] },
        'login.store': { uri: 'login', methods: ['POST'] },
        register: { uri: 'register', methods: ['GET', 'HEAD'] },
        'register.store': { uri: 'register', methods: ['POST'] },
        'verification.notification': {
            uri: 'email\/verify',
            methods: ['GET', 'HEAD'],
        },
        'verification.verify': {
            uri: 'email\/verify\/{id}\/{hash}',
            methods: ['GET', 'HEAD'],
            parameters: ['id', 'hash'],
        },
        'verification.send': { uri: 'email\/verify\/send', methods: ['POST'] },
        logout: { uri: 'logout', methods: ['POST'] },
        dashboard: { uri: 'dashboard', methods: ['GET', 'HEAD'] },
        workers: { uri: 'dashboard\/workers', methods: ['GET', 'HEAD'] },
        'workers.create': {
            uri: 'dashboard\/workers\/create',
            methods: ['GET', 'HEAD'],
        },
        'workers.store': { uri: 'dashboard\/workers', methods: ['POST'] },
        'workers.show': {
            uri: 'dashboard\/workers\/{worker}',
            methods: ['GET', 'HEAD'],
            parameters: ['worker'],
            bindings: { worker: 'id' },
        },
        'workers.update': {
            uri: 'dashboard\/workers\/{worker}',
            methods: ['PUT'],
            parameters: ['worker'],
            bindings: { worker: 'id' },
        },
        'workers.role': {
            uri: 'dashboard\/workers\/{worker}\/role',
            methods: ['PATCH'],
            parameters: ['worker'],
            bindings: { worker: 'id' },
        },
        'workers.destroy': {
            uri: 'dashboard\/workers\/{worker}',
            methods: ['DELETE'],
            parameters: ['worker'],
            bindings: { worker: 'id' },
        },
        services: { uri: 'dashboard\/services', methods: ['GET', 'HEAD'] },
        'services.create': {
            uri: 'dashboard\/services\/create',
            methods: ['GET', 'HEAD'],
        },
        'services.store': { uri: 'dashboard\/services', methods: ['POST'] },
        'services.show': {
            uri: 'dashboard\/services\/{service}',
            methods: ['GET', 'HEAD'],
            parameters: ['service'],
            bindings: { service: 'slug' },
        },
        'services.edit': {
            uri: 'dashboard\/services\/{service}\/edit',
            methods: ['GET', 'HEAD'],
            parameters: ['service'],
        },
        'services.update': {
            uri: 'dashboard\/services\/{service}',
            methods: ['PUT'],
            parameters: ['service'],
            bindings: { service: 'slug' },
        },
        'services.active': {
            uri: 'dashboard\/services\/{service}\/active',
            methods: ['PATCH'],
            parameters: ['service'],
            bindings: { service: 'slug' },
        },
        'services.destroy': {
            uri: 'dashboard\/services\/{service}',
            methods: ['DELETE'],
            parameters: ['service'],
            bindings: { service: 'slug' },
        },
        'storage.local': {
            uri: 'storage\/{path}',
            methods: ['GET', 'HEAD'],
            wheres: { path: '.*' },
            parameters: ['path'],
        },
        'storage.local.upload': {
            uri: 'storage\/{path}',
            methods: ['PUT'],
            wheres: { path: '.*' },
            parameters: ['path'],
        },
    },
};

if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
    Object.assign(Ziggy.routes, window.Ziggy.routes);
}

export { Ziggy };
