import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminOffers() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [includeSubscribers, setIncludeSubscribers] = useState(true);

  const sendOfferMutation = useMutation({
    mutationFn: () =>
      adminApi.sendOfferCampaign({
        subject,
        message,
        includeSubscribers,
      }),
    onSuccess: (response: any) => {
      const total = response?.data?.recipients ?? 0;
      toast.success(`Campaign sent to ${total} recipients`);
      setSubject("");
      setMessage("");
      setIncludeSubscribers(true);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send campaign");
    },
  });

  const isDisabled = !subject.trim() || !message.trim() || sendOfferMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display">Send promotional offer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-dashed bg-secondary/30 p-3">
            <Checkbox
              id="includeSubscribers"
              checked={includeSubscribers}
              onCheckedChange={(checked) => setIncludeSubscribers(Boolean(checked))}
            />
            <Label htmlFor="includeSubscribers" className="cursor-pointer">
              Include subscribed customers in the campaign
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Weekend wellness offer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the campaign content here..."
              rows={8}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => sendOfferMutation.mutate()}
              disabled={isDisabled}
              className="gap-2"
            >
              {sendOfferMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send campaign
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
