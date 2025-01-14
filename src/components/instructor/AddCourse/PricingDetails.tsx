import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { IndianRupee, Clock } from 'lucide-react';
import { PricingDetail } from '../../../types/Courses'; // Assuming your types are imported from this location

const PricingSchema = Yup.object().shape({
  type: Yup.string().required('Please select a pricing type'),

  amount: Yup.number()
    .test(
      'price-required',
      'Price is required and must be greater than 0 when pricing type is paid',
      function (value) {
        const { type } = this.parent;
        if (type === 'paid') {
          return value !== undefined && value > 0;
        }
        return true; // No validation for 'amount' when type is not 'paid'
      }
    )
    .typeError('Amount must be a number'),

  subscriptionType: Yup.string().test(
    'subscription-required',
    'Please select a subscription type when pricing type is paid',
    function (value) {
      const { type } = this.parent;
      if (type === 'paid') {
        return value !== undefined && value.length > 0;
      }
      return true; // No validation for 'subscriptionType' when type is not 'paid'
    }
  ),

  hasLifetimeAccess: Yup.boolean(),
});


interface PricingDetailsProps {
  onSubmit: (values: PricingDetail) => void;
  onBack: () => void;
  onNext: () => void;
  pricing: PricingDetail; // Use the PricingDetail interface here
}

const PricingDetails: React.FC<PricingDetailsProps> = ({ onSubmit, onBack, onNext, pricing }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Pricing Details</h2>
      
      <Formik
        initialValues={{
          type: pricing.type || 'free', // Defaults to 'free' if no value is provided
          amount: pricing.amount || 0,
          subscriptionType: pricing.subscriptionType || 'one-time',
          hasLifetimeAccess: pricing.hasLifetimeAccess || false,
        }}
        validationSchema={PricingSchema}
        onSubmit={(values) => {
          onSubmit(values);
          onNext(); // Moving to the next step after submission
        }}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Pricing Type Selection */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Pricing Type</label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Field
                    type="radio"
                    name="type"
                    value="free"
                    className="sr-only"
                  />
                  <div className={`flex flex-col items-center ${values.type === 'free' ? 'text-fuchsia-600' : 'text-gray-500'}`}>
                    <span className="text-lg font-medium">Free</span>
                    <span className="text-sm">No payment required</span>
                  </div>
                  {values.type === 'free' && (
                    <div className="absolute inset-0 border-2 border-fuchsia-600 rounded-lg pointer-events-none" />
                  )}
                </label>
                
                <label className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Field
                    type="radio"
                    name="type"
                    value="paid"
                    className="sr-only"
                  />
                  <div className={`flex flex-col items-center ${values.type === 'paid' ? 'text-fuchsia-600' : 'text-gray-500'}`}>
                    <span className="text-lg font-medium">Paid</span>
                    <span className="text-sm">Set your price</span>
                  </div>
                  {values.type === 'paid' && (
                    <div className="absolute inset-0 border-2 border-fuchsia-600 rounded-lg pointer-events-none" />
                  )}
                </label>
              </div>
            </div>

            {/* Conditional Pricing Fields */}
            {errors.type && touched.type && <div className="text-red-500 text-sm">{errors.type}</div>}

            {values.type === 'paid' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-gray-400" />
                    </div>
                    <Field
                      type="number"
                      name="amount"
                      className={`block w-full pl-10 pr-12 py-2 border rounded-md ${
                        errors.amount && touched.amount ? 'border-red-500' : ''
                      }`}
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">IND</span>
                    </div>
                  </div>
                  {errors.amount && touched.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
                </div>

                {/* Subscription Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* One-time Payment Option */}
                    <label className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <Field
                        type="radio"
                        name="subscriptionType"
                        value="one-time"
                        className="sr-only"
                      />
                      <div
                        className={`flex flex-col items-center ${
                          values.subscriptionType === 'one-time' ? 'text-fuchsia-600' : 'text-gray-500'
                        }`}
                      >
                        <IndianRupee className="h-6 w-6 mb-1" />
                        <span className="text-sm font-medium">One-time Payment</span>
                      </div>
                      {values.subscriptionType === 'one-time' && (
                        <div className="absolute inset-0 border-2 border-fuchsia-600 rounded-lg pointer-events-none" />
                      )}
                    </label>

                    {/* Subscription Option */}
                    {/* <label className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <Field
                        type="radio"
                        name="subscriptionType"
                        value="subscription"
                        className="sr-only"
                      />
                      <div
                        className={`flex flex-col items-center ${
                          values.subscriptionType === 'subscription' ? 'text-fuchsia-600' : 'text-gray-500'
                        }`}
                      >
                        <Clock className="h-6 w-6 mb-1" />
                        <span className="text-sm font-medium">Subscription</span>
                      </div>
                      {values.subscriptionType === 'subscription' && (
                        <div className="absolute inset-0 border-2 border-fuchsia-600 rounded-lg pointer-events-none" />
                      )}
                    </label> */}
                  </div>
                  {errors.subscriptionType && touched.subscriptionType && (
                    <div className="text-red-500 text-sm">{errors.subscriptionType}</div>
                  )}
                </div>
              </>
            )}

            {/* Lifetime Access Toggle */}
            <div className="flex items-center space-x-4">
              <Field
                type="checkbox"
                name="hasLifetimeAccess"
                className="h-4 w-4"
              />
              <label className="text-sm font-medium text-gray-700">Lifetime Access</label>
            </div>

            <div className="mt-6 flex justify-between">
              <button type="button" className="btn btn-secondary" onClick={onBack}>Back</button>
              <button type="submit" className="btn btn-primary">Next</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PricingDetails;
