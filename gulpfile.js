/*jslint node: true*/
'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var merge = require('merge-stream');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var source = require('vinyl-source-stream');

var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// Lint JavaScript
gulp.task('jshint', function () {
    return gulp.src([
        'www/scripts/**/*.js',
        '!www/scripts/ts/**/*.js',
        '!www/scripts/application.js',
        'www/elements/**/*.js',
        'www/elements/**/*.html'
    ])
        .pipe(reload({stream: true, once: true}))
        .pipe($.jshint.extract()) // Extract JS from .html files
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function () {
	var processing = $.imagemin({
		progressive: true,
		interlaced: true
	});
	// Temporary disable cache until issue with vinyl-fs would be resolved.
	//processing = $.cache(processing);
	return gulp.src('www/images/**/*')
		.pipe($.newer('dist/images'))
        .pipe(processing)
        .pipe(gulp.dest('dist/images'))
        .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
    var app = gulp.src([
        'www/*',
        '!www/test',
        'node_modules/apache-server-configs/dist/.htaccess'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
    var bower = gulp.src(['bower_components/**/*'])
		.pipe($.newer('dist/bower_components'))
		.pipe(gulp.dest('dist/bower_components'));

    var elements = gulp.src(['app/elements/**/*.html'])
        .pipe($.replace(/\.\.\/bower_components/g, 'bower_components'))
        .pipe(gulp.dest('dist/elements'));

    var vulcanized = gulp.src(['app/elements/elements.html'])
        .pipe($.replace(/\.\.\/bower_components/g, 'bower_components'))
        .pipe($.rename('elements.vulcanized.html'))
        .pipe(gulp.dest('dist/elements'));

    return merge(app, bower, elements, vulcanized).pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
	return gulp.src('app/fonts/**')
		.pipe($.newer('dist/fonts'))
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
    return gulp.src([
        'app/styles/**/*.css',
        'app/styles/*.scss'
    ])
        .pipe($.changed('styles', {extension: '.scss'}))
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10
        })
            .on('error', console.error.bind(console)))
        .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
        .pipe(gulp.dest('.tmp/styles'))
        // Concatenate And Minify Styles
        .pipe($.if('*.css', $.cssmin()))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size({title: 'styles'}));
});

gulp.task('css-elements', function () {
    return gulp.src([
        'app/elements/**/*.css',
        'app/elements/**/*.scss'
    ])
    .pipe($.changed('css-elements', {extension: '.scss'}))
    .pipe($.rubySass({
        style: 'expanded',
        precision: 10
      })
      .on('error', console.error.bind(console))
    )
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/elements'))
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.cssmin()))
    .pipe(gulp.dest('dist/elements'))
    .pipe($.size({title: 'css-elements'}));
});

gulp.task('js-elements', function () {
	return gulp.src([
        'app/elements/**/*.js'
	])
    //.pipe($.changed('js-elements', { extension: '.scss' }))
    //.pipe($.rubySass({
    //	style: 'expanded',
    //	precision: 10
    //})
    //  .on('error', console.error.bind(console))
    //)
    //.pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/elements'))
    // Concatenate And Minify Styles
    //.pipe($.if('*.js', $.cssmin()))
    .pipe(gulp.dest('dist/elements'))
    .pipe($.size({ title: 'js-elements' }));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app', 'dist']});

  return gulp.src(['app/**/*.html', '!app/{elements,test}/**/*.html'])
    // Replace path for vulcanized assets
    .pipe($.if('*.html', $.replace('elements/elements.html', 'elements/elements.vulcanized.html')))
    .pipe(assets)
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.cssmin()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Vulcanize imports
gulp.task('vulcanize', function () {
  var DEST_DIR = 'dist/elements';

  return gulp.src('dist/elements/elements.vulcanized.html')
    .pipe($.vulcanize({
      dest: DEST_DIR,
      strip: true
    }))
    .pipe(gulp.dest(DEST_DIR))
    .pipe($.size({title: 'vulcanize'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'css-elements'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp', 'www'],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch(['www/**/*.html'], reload);
  gulp.watch(['www/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['www/elements/**/*.{scss,css}'], ['css-elements', reload]);
  gulp.watch(['www/elements/**/*.{js}'], ['js-elements', reload]);
  gulp.watch(['www/scripts/**/*.js'], ['jshint']);
  gulp.watch(['www/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist'
  });
});

gulp.task('copyCordova', function () {
	var app = gulp.src([
        'dist/**/*',
		'!dist/index.html'
	]).pipe(gulp.dest('../www'));

	return merge(app).pipe($.size({ title: 'copyCordova' }));
});

// Prepare for running Cordova application
gulp.task('cordova', ['default'], function (cb) {
	runSequence(
	  ['copyCordova'],
	  cb);
});

// Build Production Files, the Default Task
gulp.task('default', function (cb) {
	runSequence(
		// ['clean'],
    ['copy', 'styles'],
    ['css-elements', 'js-elements'],
    ['jshint', 'images', 'fonts', 'html'],
    'vulcanize',
    cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', function (cb) {
  // Update the below URL to the public URL of your site
  pagespeed.output('example.com', {
    strategy: 'mobile',
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb);
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
try { require('web-component-tester').gulp.init(gulp); } catch (err) {}

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
