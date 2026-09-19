{{-- Shared font registration for PDF documents. Works on both render paths:
     - spatie/laravel-pdf + Gotenberg: Chromium cannot fetch local file paths,
       so fonts are inlined as base64 data URIs.
     - barryvdh/laravel-dompdf (legacy): parses data URIs as well.
     TTFs live in public/geist and public/geist_mono (SIL OFL).
     Include this INSIDE a <style> block. --}}
@php
    $pdfFontCss = function () {
        static $cache = null;

        if ($cache !== null) {
            return $cache;
        }

        $families = [
            'Geist' => 'geist',
            'Geist Mono' => 'geist_mono',
        ];

        $weights = [
            400 => 'Regular',
            500 => 'Medium',
            600 => 'SemiBold',
            700 => 'Bold',
            800 => 'ExtraBold',
        ];

        $css = '';

        foreach ($families as $family => $dir) {
            foreach ($weights as $weight => $suffix) {
                $fileName = ($family === 'Geist' ? 'Geist' : 'GeistMono').'-'.$suffix.'.ttf';
                $path = public_path($dir.'/'.$fileName);

                if (! is_file($path)) {
                    continue;
                }

                $css .= sprintf(
                    "@font-face{font-family:'%s';font-style:normal;font-weight:%d;src:url(data:font/ttf;base64,%s) format('truetype');}",
                    $family,
                    $weight,
                    base64_encode(file_get_contents($path))
                );
            }
        }

        return $cache = $css;
    };
@endphp
{!! $pdfFontCss() !!}
