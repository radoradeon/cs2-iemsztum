<?php

namespace App\Services;

class RconService
{
    protected $host;
    protected $port;
    protected $password;

    public function __construct(string $serverString)
    {
        $parts = explode(':', $serverString);
        $this->host = $parts[0] ?? '127.0.0.1';
        $this->port = (int)($parts[1] ?? 27015);
        $this->password = $parts[2] ?? '';
    }

    public function sendCommand(string $command): ?string
    {
        $socket = @fsockopen($this->host, $this->port, $errno, $errstr, 3);
        if (!$socket) {
            return null;
        }

        if (!$this->auth($socket)) {
            fclose($socket);
            return null;
        }

        $response = $this->execPacket($socket, 2, $command);
        fclose($socket);

        return $response;
    }

    protected function auth($socket): bool
    {
        $packet = pack("VV", 0, 3) . $this->password . "\x00\x00";
        $packet = pack("V", strlen($packet)) . $packet;
        fwrite($socket, $packet);

        $response = fread($socket, 4096);
        if (strlen($response) < 12) return false;

        $unpack = unpack("Vsize/Vid/Vtype", substr($response, 0, 12));
        return $unpack['id'] !== -1;
    }

    protected function execPacket($socket, int $type, string $body): string
    {
        $packet = pack("VV", 1, $type) . $body . "\x00\x00";
        $packet = pack("V", strlen($packet)) . $packet;
        fwrite($socket, $packet);

        $response = '';
        while ($chunk = fread($socket, 4096)) {
            $response .= $chunk;
            if (strlen($chunk) < 1400) break;
        }

        return $response;
    }
}