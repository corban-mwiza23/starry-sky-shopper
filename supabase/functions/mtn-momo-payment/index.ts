import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, amount, orderId } = await req.json();
    console.log('MTN MoMo payment request:', { phoneNumber, amount, orderId });

    if (!phoneNumber || !amount) {
      throw new Error('Phone number and amount are required');
    }

    // Get MTN API credentials from environment
    const mtnApiUserId = Deno.env.get('MTN_API_USER_ID');
    const mtnApiKey = Deno.env.get('MTN_API_KEY');
    const mtnSubscriptionKey = Deno.env.get('MTN_SUBSCRIPTION_KEY');

    if (!mtnApiUserId || !mtnApiKey || !mtnSubscriptionKey) {
      throw new Error('MTN API credentials not configured');
    }

    // MTN MoMo API endpoints (sandbox)
    const baseUrl = 'https://sandbox.momodeveloper.mtn.com';
    
    // Step 1: Generate access token
    const tokenResponse = await fetch(`${baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${mtnApiUserId}:${mtnApiKey}`)}`,
        'Ocp-Apim-Subscription-Key': mtnSubscriptionKey,
        'Content-Type': 'application/json',
      }
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log('Access token obtained successfully');

    // Step 2: Create payment request
    const referenceId = crypto.randomUUID();
    const paymentPayload = {
      amount: amount.toString(),
      currency: 'RWF',
      externalId: orderId || referenceId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: phoneNumber.replace(/^\+/, '') // Remove + if present
      },
      payerMessage: 'Payment for your order',
      payeeNote: 'Thank you for your purchase'
    };

    console.log('Creating payment request with payload:', paymentPayload);

    const paymentResponse = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Reference-Id': referenceId,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': mtnSubscriptionKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentPayload)
    });

    console.log('Payment response status:', paymentResponse.status);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Payment request failed:', errorText);
      throw new Error(`Payment request failed: ${paymentResponse.statusText}`);
    }

    // Step 3: Check payment status
    const statusResponse = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Target-Environment': 'sandbox',
        'Ocp-Apim-Subscription-Key': mtnSubscriptionKey,
      }
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to check payment status: ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();
    console.log('Payment status:', statusData);

    // Update order in Supabase if payment is successful
    if (orderId && statusData.status === 'SUCCESSFUL') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_method: 'mtn_momo',
          payment_reference: referenceId
        })
        .eq('id', orderId);

      console.log('Order updated successfully');
    }

    return new Response(JSON.stringify({
      success: true,
      referenceId,
      status: statusData.status,
      message: statusData.status === 'SUCCESSFUL' 
        ? 'Payment completed successfully' 
        : 'Payment is being processed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in MTN MoMo payment function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});