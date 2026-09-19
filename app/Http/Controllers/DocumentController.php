<?php

namespace App\Http\Controllers;

use App\Models\Payable;
use App\Models\Receivable;
use App\Models\Setting;
use App\Models\Transaction;
use App\Services\ThermalPrintService;
use Illuminate\Http\Request;
use Picqer\Barcode\BarcodeGeneratorPNG;
use Spatie\LaravelPdf\Facades\Pdf;

class DocumentController extends Controller
{
    private function storeProfile(): array
    {
        $logo = Setting::get('store_logo');
        if ($logo && ! str_starts_with($logo, 'http') && ! str_starts_with($logo, '/storage')) {
            $logo = asset('storage/'.ltrim($logo, '/'));
        }

        $logoData = null;
        if ($logo) {
            $localPath = null;
            if (str_starts_with($logo, asset('storage'))) {
                $localPath = public_path(str_replace(asset(''), '', $logo));
            } elseif (str_starts_with($logo, '/storage')) {
                $localPath = public_path($logo);
            }

            if ($localPath && file_exists($localPath)) {
                $logoData = 'data:image/png;base64,'.base64_encode(file_get_contents($localPath));
            }
        }

        return [
            'name' => Setting::get('store_name', 'Toko Anda'),
            'logo' => $logo,
            'logo_data' => $logoData,
            'address' => Setting::get('store_address', ''),
            'phone' => Setting::get('store_phone', ''),
            'email' => Setting::get('store_email', ''),
            'website' => Setting::get('store_website', ''),
        ];
    }

    private function barcode(string $code): string
    {
        $generator = new BarcodeGeneratorPNG;
        $data = $generator->getBarcode($code, $generator::TYPE_CODE_128);

        return 'data:image/png;base64,'.base64_encode($data);
    }

    public function invoice(string $invoice)
    {
        $transaction = Transaction::with(['details.product', 'cashier', 'customer'])
            ->where('invoice', $invoice)
            ->firstOrFail();

        return Pdf::view('pdf.invoice', [
            'transaction' => $transaction,
            'store' => $this->storeProfile(),
            'barcode' => $this->barcode($transaction->invoice),
        ])
            ->format('a4')
            ->margins(0, 0, 0, 0, 'mm')
            ->inline("invoice-{$transaction->invoice}.pdf");
    }

    /**
     * Public version of invoice (no auth needed, but requires the transaction access token).
     */
    public function publicInvoice(string $invoice, Request $request)
    {
        $transaction = Transaction::with(['details.product', 'cashier', 'customer'])
            ->where('invoice', $invoice)
            ->where('access_token', $request->query('token'))
            ->firstOrFail();

        return Pdf::view('pdf.invoice', [
            'transaction' => $transaction,
            'store' => $this->storeProfile(),
            'barcode' => $this->barcode($transaction->invoice),
        ])
            ->format('a4')
            ->margins(0, 0, 0, 0, 'mm')
            ->inline("invoice-{$transaction->invoice}.pdf");
    }

    public function receipt(string $invoice, string $size = '80')
    {
        $transaction = Transaction::with(['details.product', 'cashier', 'customer'])
            ->where('invoice', $invoice)
            ->firstOrFail();

        $template = $size === '58' ? 'pdf.receipt_58' : 'pdf.receipt_80';
        $width = $size === '58' ? 58 : 80;

        return Pdf::view($template, [
            'transaction' => $transaction,
            'store' => $this->storeProfile(),
            'barcode' => $this->barcode($transaction->invoice),
            'locale' => app()->getLocale(),
        ])
            ->paperSize($width, 282, 'mm')
            ->margins(0, 0, 0, 0, 'mm')
            ->inline("receipt-{$transaction->invoice}-{$size}.pdf");
    }

    public function shipping(string $invoice)
    {
        $transaction = Transaction::with(['details.product', 'customer', 'cashier'])
            ->where('invoice', $invoice)
            ->firstOrFail();

        return Pdf::view('pdf.shipping_label', [
            'transaction' => $transaction,
            'store' => $this->storeProfile(),
            'barcode' => $this->barcode($transaction->invoice),
        ])
            ->paperSize(150, 100, 'mm')
            ->margins(0, 0, 0, 0, 'mm')
            ->inline("shipping-{$transaction->invoice}.pdf");
    }

    public function thermalPrint(string $invoice)
    {
        $transaction = Transaction::with(['details.product', 'cashier', 'customer'])
            ->where('invoice', $invoice)
            ->firstOrFail();

        $service = app(ThermalPrintService::class);
        $html = $service->generateReceiptHtml($transaction);

        return response($html)->header('Content-Type', 'text/html; charset=utf-8');
    }

    public function receivable(Receivable $receivable)
    {
        $receivable->load(['customer', 'payments.bankAccount', 'payments.user']);

        return Pdf::view('pdf.receivable', [
            'receivable' => $receivable,
            'store' => $this->storeProfile(),
            'barcode' => $this->barcode($receivable->invoice),
        ])
            ->format('a5')
            ->margins(10, 10, 10, 10, 'mm')
            ->inline("piutang-{$receivable->invoice}.pdf");
    }

    public function payable(Payable $payable)
    {
        $payable->load(['supplier', 'payments.bankAccount', 'payments.user']);

        return Pdf::view('pdf.payable', [
            'payable' => $payable,
            'store' => $this->storeProfile(),
            'barcode' => $this->barcode($payable->document_number),
        ])
            ->format('a5')
            ->margins(10, 10, 10, 10, 'mm')
            ->inline("hutang-{$payable->document_number}.pdf");
    }
}
